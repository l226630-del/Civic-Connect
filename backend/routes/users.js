const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { handleSingleUpload } = require("../middleware/upload");
const User = require("../models/User");
const Issue = require("../models/Issue");
const {
  getUserStats,
  checkAchievements,
  getLeaderboard,
  getUserRank,
  ACHIEVEMENTS,
} = require("../services/gamificationService");




router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    
    const stats = await getUserStats(user._id);
    const rank = await getUserRank(user._id);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats,
        rank,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
});




router.put("/profile", protect, handleSingleUpload, async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    
    if (req.file) {
      updates.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
});




router.get("/stats", protect, async (req, res) => {
  try {
    const stats = await getUserStats(req.user._id);
    const rank = await getUserRank(req.user._id);

    res.json({
      success: true,
      data: {
        ...stats,
        rank,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
    });
  }
});




router.get("/achievements", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userAchievements = user.achievements || [];

    
    const achievements = Object.values(ACHIEVEMENTS).map((achievement) => ({
      ...achievement,
      earned: userAchievements.includes(achievement.id),
      condition: undefined, 
    }));

    res.json({
      success: true,
      data: {
        earned: achievements.filter((a) => a.earned),
        available: achievements.filter((a) => !a.earned),
        totalPoints: achievements.filter((a) => a.earned).reduce((sum, a) => sum + a.points, 0),
      },
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching achievements",
    });
  }
});




router.post("/check-achievements", protect, async (req, res) => {
  try {
    const newAchievements = await checkAchievements(req.user._id);

    res.json({
      success: true,
      data: {
        newAchievements: newAchievements.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          points: a.points,
        })),
      },
    });
  } catch (error) {
    console.error("Check achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking achievements",
    });
  }
});




router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 20, timeframe = "all" } = req.query;
    const leaderboard = await getLeaderboard(parseInt(limit), timeframe);

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
    });
  }
});




router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "username profilePhoto bio points achievements createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    
    const issueCount = await Issue.countDocuments({ creator: user._id });
    const resolvedCount = await Issue.countDocuments({
      creator: user._id,
      status: { $in: ["resolved", "closed"] },
    });
    const rank = await getUserRank(user._id);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        issueCount,
        resolvedCount,
        rank,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
});

module.exports = router;
