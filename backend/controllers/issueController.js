const Issue = require("../models/Issue");
const { validationResult } = require("express-validator");
const {
    notifyStatusChange,
    notifyDepartmentAssigned,
    notifyUpvoteMilestone,
} = require("../services/notificationService");
const {
    awardPoints,
    checkAchievements,
    POINTS,
} = require("../services/gamificationService");




const createIssue = async (req, res) =>
{
    try
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { title, description, category, location, department } = req.body;


        const photos = req.files
            ? req.files.map((file) => `/uploads/${file.filename}`)
            : [];

        // Parse location if it's a string (from form-data)
        let parsedLocation = location;
        if (typeof location === "string")
        {
            try
            {
                parsedLocation = JSON.parse(location);
            } catch (e)
            {
                return res.status(400).json({
                    success: false,
                    message: "Invalid location format",
                });
            }
        }

        const issue = await Issue.create({
            title,
            description,
            category,
            photos,
            location: parsedLocation,
            department: department || null,
            creator: req.user._id,
        });

        await issue.populate([
            { path: "creator", select: "username profilePhoto" },
            { path: "department", select: "name" },
        ]);


        await awardPoints(req.user._id, POINTS.ISSUE_CREATED, "issue_created");


        checkAchievements(req.user._id);

        res.status(201).json({
            success: true,
            data: issue,
        });
    } catch (error)
    {
        console.error("Create issue error:", error);
        res.status(500).json({
            success: false,
            message: "Server error creating issue",
        });
    }
};




const getIssues = async (req, res) =>
{
    try
    {
        const {
            category,
            status,
            department,
            search,
            lat,
            lng,
            radius = 10,
            startDate,
            endDate,
            sortBy = "createdAt",
            sortOrder = "desc",
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};


        if (category)
        {
            query.category = category;
        }


        if (status)
        {
            query.status = status;
        }


        if (department)
        {
            query.department = department;
        }


        if (search)
        {
            query.$text = { $search: search };
        }


        if (lat && lng)
        {
            query["location"] = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseFloat(radius) * 1000,
                },
            };
        }


        if (startDate || endDate)
        {
            query.createdAt = {};
            if (startDate)
            {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate)
            {
                query.createdAt.$lte = new Date(endDate);
            }
        }


        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const [issues, total] = await Promise.all([
            Issue.find(query)
                .populate("creator", "username profilePhoto")
                .populate("department", "name")
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            Issue.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: issues,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error)
    {
        console.error("Get issues error:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching issues",
        });
    }
};




const getIssue = async (req, res) =>
{
    try
    {
        const issue = await Issue.findById(req.params.id)
            .populate("creator", "username profilePhoto")
            .populate("department", "name")
            .populate("upvotes", "username");

        if (!issue)
        {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        res.json({
            success: true,
            data: issue,
        });
    } catch (error)
    {
        console.error("Get issue error:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching issue",
        });
    }
};




const deleteIssue = async (req, res) =>
{
    try
    {
        const issue = await Issue.findById(req.params.id);

        if (!issue)
        {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }


        if (
            issue.creator.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        )
        {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this issue",
            });
        }

        await issue.deleteOne();

        res.json({
            success: true,
            message: "Issue deleted successfully",
        });
    } catch (error)
    {
        console.error("Delete issue error:", error);
        res.status(500).json({
            success: false,
            message: "Server error deleting issue",
        });
    }
};




const toggleUpvote = async (req, res) =>
{
    try
    {
        const issue = await Issue.findById(req.params.id);

        if (!issue)
        {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const userId = req.user._id;
        const upvoteIndex = issue.upvotes.indexOf(userId);

        if (upvoteIndex > -1)
        {

            issue.upvotes.splice(upvoteIndex, 1);
        } else
        {

            issue.upvotes.push(userId);


            const creatorId =
                issue.creator._id?.toString() || issue.creator.toString();
            if (creatorId !== userId.toString())
            {

                awardPoints(creatorId, POINTS.RECEIVED_UPVOTE, "received_upvote");

                awardPoints(userId, POINTS.GAVE_UPVOTE, "gave_upvote");

                checkAchievements(creatorId);
                checkAchievements(userId);
            }


            notifyUpvoteMilestone(issue, issue.upvotes.length);
        }

        await issue.save();

        res.json({
            success: true,
            data: {
                upvoteCount: issue.upvotes.length,
                hasUpvoted: upvoteIndex === -1,
            },
        });
    } catch (error)
    {
        console.error("Toggle upvote error:", error);
        res.status(500).json({
            success: false,
            message: "Server error toggling upvote",
        });
    }
};






const updateIssueStatus = async (req, res) =>
{
    try
    {
        const { status, department, departmentId } = req.body;

        const issue = await Issue.findById(req.params.id);

        if (!issue)
        {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const oldStatus = issue.status;
        const oldDepartment = issue.department;

        if (status && status !== oldStatus)
        {
            issue.status = status;
        }


        const deptValue = departmentId || department;
        if (deptValue !== undefined)
        {
            issue.department = deptValue || null;
        }

        await issue.save();

        await issue.populate([
            { path: "creator", select: "username profilePhoto" },
            { path: "department", select: "name email" },
        ]);


        if (status && status !== oldStatus)
        {
            notifyStatusChange(issue, status, oldStatus);


            if (status === "resolved")
            {
                await awardPoints(
                    issue.creator._id || issue.creator,
                    POINTS.ISSUE_RESOLVED,
                    "issue_resolved"
                );
                checkAchievements(issue.creator._id || issue.creator);
            }
        }

        if (
            deptValue &&
            deptValue !== oldDepartment?.toString() &&
            issue.department
        )
        {
            notifyDepartmentAssigned(issue, issue.department);
        }

        res.json({
            success: true,
            data: issue,
        });
    } catch (error)
    {
        console.error("Update issue status error:", error);
        res.status(500).json({
            success: false,
            message: "Server error updating issue status",
        });
    }
};




const getMyIssues = async (req, res) =>
{
    try
    {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [issues, total] = await Promise.all([
            Issue.find({ creator: req.user._id })
                .populate("department", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Issue.countDocuments({ creator: req.user._id }),
        ]);

        res.json({
            success: true,
            data: issues,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error)
    {
        console.error("Get my issues error:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching your issues",
        });
    }
};




const updateIssue = async (req, res) =>
{
    try
    {
        const { title, description, category, location, existingPhotos } = req.body;

        const issue = await Issue.findById(req.params.id);

        if (!issue)
        {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }


        if (issue.creator.toString() !== req.user._id.toString())
        {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this issue",
            });
        }


        if (issue.status !== "pending")
        {
            return res.status(400).json({
                success: false,
                message: "Cannot update issue that is already being processed",
            });
        }


        if (title) issue.title = title;
        if (description) issue.description = description;
        if (category) issue.category = category;


        if (location)
        {
            let parsedLocation = location;
            if (typeof location === "string")
            {
                try
                {
                    parsedLocation = JSON.parse(location);
                } catch (e)
                {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid location format",
                    });
                }
            }
            issue.location = parsedLocation;
        }


        let keptPhotos = [];
        if (existingPhotos)
        {
            try
            {
                keptPhotos =
                    typeof existingPhotos === "string"
                        ? JSON.parse(existingPhotos)
                        : existingPhotos;
            } catch (e)
            {
                keptPhotos = [];
            }
        }


        let newPhotos = [];
        if (req.files && req.files.length > 0)
        {
            newPhotos = req.files.map((file) => "/uploads/" + file.filename);
        }


        issue.photos = [...keptPhotos, ...newPhotos].slice(0, 5);

        await issue.save();

        await issue.populate([
            { path: "creator", select: "username profilePhoto" },
            { path: "department", select: "name" },
        ]);

        res.json({
            success: true,
            data: issue,
        });
    } catch (error)
    {
        console.error("Update issue error:", error);
        res.status(500).json({
            success: false,
            message: "Server error updating issue",
        });
    }
};

module.exports = {
    createIssue,
    getIssues,
    getIssue,
    deleteIssue,
    toggleUpvote,
    updateIssueStatus,
    getMyIssues,
    updateIssue,
};
