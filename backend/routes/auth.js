const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
    register,
    login,
    getProfile,
    updateProfile,
    uploadProfilePhoto,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { handleSingleUpload } = require("../middleware/upload");

// Validation rules
const registerValidation = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be 3-30 characters"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/profile/photo", protect, handleSingleUpload, uploadProfilePhoto);

module.exports = router;
