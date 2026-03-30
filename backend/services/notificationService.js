const Notification = require("../models/Notification");


const createNotification = async ({
    userId,
    type,
    title,
    message,
    issueId = null,
    metadata = {},
}) =>
{
    try
    {
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            issue: issueId,
            metadata,
        });
        return notification;
    } catch (error)
    {
        console.error("Error creating notification:", error);
        return null;
    }
};


const notifyStatusChange = async (issue, newStatus, oldStatus) =>
{
    const statusMessages = {
        pending: "Your issue is pending review.",
        reported: "Your issue has been reported and is awaiting review.",
        "in-progress":
            "Your issue is now being addressed by the relevant department.",
        resolved: "Great news! Your issue has been resolved.",
        closed: "Your issue has been closed.",
    };

    return createNotification({
        userId: issue.creator._id || issue.creator,
        type: "status_update",
        title: `Issue Status Updated`,
        message:
            statusMessages[newStatus] || `Your issue status changed to ${newStatus}`,
        issueId: issue._id,
        metadata: { oldStatus, newStatus },
    });
};


const notifyDepartmentAssigned = async (issue, department) =>
{
    return createNotification({
        userId: issue.creator._id || issue.creator,
        type: "department_assigned",
        title: "Department Assigned",
        message: `Your issue has been assigned to ${department.name}.`,
        issueId: issue._id,
        metadata: { departmentId: department._id, departmentName: department.name },
    });
};


const notifyNewComment = async (issue, comment, commenter) =>
{
    // Don't notify if commenter is the issue creator
    const creatorId = issue.creator._id?.toString() || issue.creator.toString();
    const commenterId = commenter._id?.toString() || commenter.toString();

    if (creatorId === commenterId)
    {
        return null;
    }

    return createNotification({
        userId: issue.creator._id || issue.creator,
        type: "new_comment",
        title: "New Comment on Your Issue",
        message: `${commenter.username || "Someone"} commented on your issue.`,
        issueId: issue._id,
        metadata: { commentId: comment._id },
    });
};


const notifyUpvoteMilestone = async (issue, upvoteCount) =>
{
    const milestones = [5, 10, 25, 50, 100];

    if (!milestones.includes(upvoteCount))
    {
        return null;
    }

    return createNotification({
        userId: issue.creator._id || issue.creator,
        type: "upvote_milestone",
        title: "Upvote Milestone Reached!",
        message: `Your issue has received ${upvoteCount} upvotes! The community supports your report.`,
        issueId: issue._id,
        metadata: { upvoteCount },
    });
};


const notifyAchievement = async (userId, achievement, points) =>
{
    return createNotification({
        userId,
        type: "achievement",
        title: "Achievement Unlocked!",
        message: `You earned the "${achievement}" badge and ${points} points!`,
        metadata: { achievement, points },
    });
};


const getUserNotifications = async (
    userId,
    { page = 1, limit = 20, unreadOnly = false }
) =>
{
    page = Number(page) || 1;
    limit = Number(limit) || 20;

    const query = { user: userId };
    if (unreadOnly) query.read = false;

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
            .populate("issue", "title status")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Notification.countDocuments(query),

        Notification.countDocuments({ user: userId, read: false }),
    ]);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
        unreadCount,
    };
};


const markAsRead = async (userId, notificationIds = []) =>
{
    const query = { user: userId };

    if (notificationIds.length > 0)
    {
        query._id = { $in: notificationIds };
    }

    await Notification.updateMany(query, { read: true });
};


const cleanupOldNotifications = async (daysOld = 30) =>
{
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true,
    });

    return result.deletedCount;
};

module.exports = {
    createNotification,
    notifyStatusChange,
    notifyDepartmentAssigned,
    notifyNewComment,
    notifyUpvoteMilestone,
    notifyAchievement,
    getUserNotifications,
    markAsRead,
    cleanupOldNotifications,
};
