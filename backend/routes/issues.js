const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
    createIssue,
    getIssues,
    getIssue,
    deleteIssue,
    toggleUpvote,
    updateIssueStatus,
    getMyIssues,
    updateIssue,
} = require("../controllers/issueController");
const { protect, isAdmin } = require("../middleware/auth");
const { handleMultipleUpload } = require("../middleware/upload");


const createIssueValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 200 })
        .withMessage("Title cannot exceed 200 characters"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 2000 })
        .withMessage("Description cannot exceed 2000 characters"),
    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isIn(["pothole", "streetlight", "garbage", "water", "roads", "other"])
        .withMessage("Invalid category"),
];


router.get("/", getIssues);

// Protected routes - Note: specific routes must come before :id routes
router.get("/user/my-issues", protect, getMyIssues);
router.get("/:id", getIssue);
router.post(
    "/",
    protect,
    handleMultipleUpload,
    createIssueValidation,
    createIssue
);
router.delete("/:id", protect, deleteIssue);
router.put("/:id", protect, handleMultipleUpload, updateIssue);
router.post("/:id/upvote", protect, toggleUpvote);

// Admin routes
router.put("/:id/status", protect, isAdmin, updateIssueStatus);
router.patch("/:id/status", protect, isAdmin, updateIssueStatus);
router.patch("/:id/assign", protect, isAdmin, updateIssueStatus);

module.exports = router;
