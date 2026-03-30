const Department = require("../models/Department");
const Issue = require("../models/Issue");
const { validationResult } = require("express-validator");




const createDepartment = async (req, res) =>
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

        const { name, description } = req.body;


        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment)
        {
            return res.status(400).json({
                success: false,
                message: "Department with this name already exists",
            });
        }

        const department = await Department.create({
            name,
            description,
        });

        res.status(201).json({
            success: true,
            data: department,
        });
    } catch (error)
    {
        console.error("Create department error:", error);
        res.status(500).json({
            success: false,
            message: "Server error creating department",
        });
    }
};




const getDepartments = async (req, res) =>
{
    try
    {
        const { activeOnly = "false" } = req.query;

        const query = {};
        if (activeOnly === "true")
        {
            query.isActive = true;
        }

        const departments = await Department.find(query).sort({ name: 1 }).lean();


        const issueCounts = await Issue.aggregate([
            { $match: { department: { $ne: null } } },
            { $group: { _id: "$department", count: { $sum: 1 } } },
        ]);


        const issueCountMap = {};
        issueCounts.forEach((item) =>
        {
            issueCountMap[item._id.toString()] = item.count;
        });


        const departmentsWithCounts = departments.map((dept) => ({
            ...dept,
            issueCount: issueCountMap[dept._id.toString()] || 0,
        }));

        res.json({
            success: true,
            data: departmentsWithCounts,
        });
    } catch (error)
    {
        console.error("Get departments error:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching departments",
        });
    }
};




const getDepartment = async (req, res) =>
{
    try
    {
        const department = await Department.findById(req.params.id);

        if (!department)
        {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        res.json({
            success: true,
            data: department,
        });
    } catch (error)
    {
        console.error("Get department error:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching department",
        });
    }
};




const updateDepartment = async (req, res) =>
{
    try
    {
        const { name, description, isActive } = req.body;

        const department = await Department.findById(req.params.id);

        if (!department)
        {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        // Check if new name conflicts with existing department
        if (name && name !== department.name)
        {
            const existingDepartment = await Department.findOne({ name });
            if (existingDepartment)
            {
                return res.status(400).json({
                    success: false,
                    message: "Department with this name already exists",
                });
            }
            department.name = name;
        }

        if (description !== undefined)
        {
            department.description = description;
        }

        if (isActive !== undefined)
        {
            department.isActive = isActive;
        }

        await department.save();

        res.json({
            success: true,
            data: department,
        });
    } catch (error)
    {
        console.error("Update department error:", error);
        res.status(500).json({
            success: false,
            message: "Server error updating department",
        });
    }
};




const deleteDepartment = async (req, res) =>
{
    try
    {
        const department = await Department.findById(req.params.id);

        if (!department)
        {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        await department.deleteOne();

        res.json({
            success: true,
            message: "Department deleted successfully",
        });
    } catch (error)
    {
        console.error("Delete department error:", error);
        res.status(500).json({
            success: false,
            message: "Server error deleting department",
        });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
};
