const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Comment = require("../models/Comment");
const Issue = require("../models/Issue");
const { awardPoints } = require("../services/gamificationService");
const { createNotification } = require("../services/notificationService");




router.get("/issue/:issueId", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({ issue: issueId })
      .populate("user", "username profilePhoto role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ issue: issueId });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
});




router.post("/issue/:issueId", protect, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const comment = await Comment.create({
      issue: issueId,
      user: req.user._id,
      text: text.trim(),
    });

    
    await comment.populate("user", "username profilePhoto role");

    
    await awardPoints(req.user._id, 3, "Added comment");

    
    if (issue.creator.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: issue.creator,
        type: "comment",
        title: "New Comment on Your Issue",
        message: `${req.user.username} commented on "${issue.title}"`,
        relatedIssue: issue._id,
      });
    }

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
    });
  }
});




router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    comment.text = text.trim();
    await comment.save();

    await comment.populate("user", "username profilePhoto role");

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating comment",
    });
  }
});




router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
    });
  }
});

module.exports = router;
