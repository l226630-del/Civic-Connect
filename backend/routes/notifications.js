const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getUserNotifications,
  markAsRead,
} = require("../services/notificationService");




router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const result = await getUserNotifications(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === "true",
    });

    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
});




router.get("/unread-count", protect, async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
    });
  }
});




router.put("/read", protect, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    await markAsRead(req.user._id, notificationIds || []);

    res.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notifications as read",
    });
  }
});




router.put("/read-all", protect, async (req, res) => {
  try {
    await markAsRead(req.user._id);

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
    });
  }
});




router.delete("/:id", protect, async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
    });
  }
});

module.exports = router;
