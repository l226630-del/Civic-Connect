const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        issue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Issue",
            required: [true, "Issue reference is required"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        text: {
            type: String,
            required: [true, "Comment text is required"],
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by issue
commentSchema.index({ issue: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
