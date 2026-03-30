const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const { validationResult } = require("express-validator");




const register = async (req, res) =>
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

        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (userExists)
        {
            return res.status(400).json({
                success: false,
                message: "User already exists with that email or username",
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
        });

        if (user)
        {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePhoto: user.profilePhoto,
                    bio: user.bio,
                    points: user.points,
                    achievements: user.achievements,
                    token: generateToken(user._id),
                },
            });
        } else
        {
            res.status(400).json({
                success: false,
                message: "Invalid user data",
            });
        }
    } catch (error)
    {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
};




const login = async (req, res) =>
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

        const { email, password } = req.body;


        const user = await User.findOne({ email }).select("+password");

        if (!user)
        {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }


        const isMatch = await user.comparePassword(password);

        if (!isMatch)
        {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        res.json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePhoto: user.profilePhoto,
                bio: user.bio,
                points: user.points,
                achievements: user.achievements,
                token: generateToken(user._id),
            },
        });
    } catch (error)
    {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login",
        });
    }
};




const getProfile = async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user._id);

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
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching profile",
        });
    }
};




const updateProfile = async (req, res) =>
{
    try
    {
        const { username, email, bio } = req.body;

        const user = await User.findById(req.user._id);

        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if username or email is taken by another user
        if (username && username !== user.username)
        {
            const usernameExists = await User.findOne({ username });
            if (usernameExists)
            {
                return res.status(400).json({
                    success: false,
                    message: "Username already taken",
                });
            }
            user.username = username;
        }

        if (email && email !== user.email)
        {
            const emailExists = await User.findOne({ email });
            if (emailExists)
            {
                return res.status(400).json({
                    success: false,
                    message: "Email already taken",
                });
            }
            user.email = email;
        }

        if (bio !== undefined)
        {
            user.bio = bio;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: updatedUser,
        });
    } catch (error)
    {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error updating profile",
        });
    }
};




const uploadProfilePhoto = async (req, res) =>
{
    try
    {
        if (!req.file)
        {
            return res.status(400).json({
                success: false,
                message: "Please upload a file",
            });
        }

        const user = await User.findById(req.user._id);

        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }


        user.profilePhoto = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({
            success: true,
            data: {
                profilePhoto: user.profilePhoto,
            },
        });
    } catch (error)
    {
        console.error("Upload photo error:", error);
        res.status(500).json({
            success: false,
            message: "Server error uploading photo",
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    uploadProfilePhoto,
};
