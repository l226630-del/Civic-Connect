const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");
const Issue = require("../models/Issue");
const Department = require("../models/Department");

// All routes require admin authentication
router.use(protect);
router.use(authorize("admin"));




router.get("/users", async (req, res) =>
{
    try
    {
        const { page = 1, limit = 50, role, search } = req.query;

        let query = {};

        if (role && role !== "all")
        {
            query.role = role;
        }

        if (search)
        {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error)
    {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
        });
    }
});




router.put("/users/:id/role", async (req, res) =>
{
    try
    {
        const { id } = req.params;
        const { role } = req.body;

        if (!["citizen", "admin", "department"].includes(role))
        {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select("-password");

        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error)
    {
        console.error("Update role error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating role",
        });
    }
});




router.get("/stats", async (req, res) =>
{
    try
    {
        const [
            totalUsers,
            totalIssues,
            totalDepartments,
            pendingIssues,
            resolvedIssues,
            issuesByStatus,
            issuesByCategory,
            recentIssues,
            topUsers,
        ] = await Promise.all([
            User.countDocuments(),
            Issue.countDocuments(),
            Department.countDocuments(),
            Issue.countDocuments({ status: "pending" }),
            Issue.countDocuments({ status: { $in: ["resolved", "closed"] } }),
            Issue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            Issue.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
            Issue.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("creator", "username")
                .select("title status category createdAt"),
            User.find({ role: "citizen" })
                .sort({ points: -1 })
                .limit(5)
                .select("username points profilePhoto"),
        ]);


        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const issuesTrend = await Issue.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalIssues,
                totalDepartments,
                pendingIssues,
                resolvedIssues,
                resolutionRate:
                    totalIssues > 0
                        ? Math.round((resolvedIssues / totalIssues) * 100)
                        : 0,
                issuesByStatus: issuesByStatus.reduce((acc, item) =>
                {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                issuesByCategory,
                recentIssues,
                topUsers,
                issuesTrend,
            },
        });
    } catch (error)
    {
        console.error("Get stats error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching stats",
        });
    }
});




router.get("/analytics", async (req, res) =>
{
    try
    {
        const { period = "30" } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));

        const [
            issuesByDay,
            issuesByCategory,
            issuesByPriority,
            issuesByDepartment,
            avgResolutionTime,
            userGrowth,
        ] = await Promise.all([
            // Issues created per day
            Issue.aggregate([
                { $match: { createdAt: { $gte: daysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            // Issues by category
            Issue.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            // Issues by priority
            Issue.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
            // Issues by department
            Issue.aggregate([
                { $match: { department: { $ne: null } } },
                {
                    $lookup: {
                        from: "departments",
                        localField: "department",
                        foreignField: "_id",
                        as: "dept",
                    },
                },
                { $unwind: "$dept" },
                {
                    $group: {
                        _id: "$dept.name",
                        count: { $sum: 1 },
                        resolved: {
                            $sum: {
                                $cond: [{ $in: ["$status", ["resolved", "closed"]] }, 1, 0],
                            },
                        },
                    },
                },
                { $sort: { count: -1 } },
            ]),
            // Average resolution time (for resolved issues)
            Issue.aggregate([
                { $match: { status: { $in: ["resolved", "closed"] } } },
                {
                    $project: {
                        resolutionTime: { $subtract: ["$updatedAt", "$createdAt"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        avgTime: { $avg: "$resolutionTime" },
                    },
                },
            ]),
            // User growth
            User.aggregate([
                { $match: { createdAt: { $gte: daysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                issuesByDay,
                issuesByCategory,
                issuesByPriority,
                issuesByDepartment,
                avgResolutionTime: avgResolutionTime[0]?.avgTime
                    ? Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60 * 24))
                    : 0,
                userGrowth,
            },
        });
    } catch (error)
    {
        console.error("Get analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching analytics",
        });
    }
});

module.exports = router;
