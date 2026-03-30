const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
} = require("../controllers/departmentController");
const { protect, isAdmin } = require("../middleware/auth");


const departmentValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Department name is required")
        .isLength({ max: 100 })
        .withMessage("Department name cannot exceed 100 characters"),
];

// Public routes
router.get("/", getDepartments);
router.get("/:id", getDepartment);

// Admin routes
router.post("/", protect, isAdmin, departmentValidation, createDepartment);
router.put("/:id", protect, isAdmin, updateDepartment);
router.delete("/:id", protect, isAdmin, deleteDepartment);

module.exports = router;
