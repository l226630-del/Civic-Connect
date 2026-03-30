const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: {
                values: [
                    "pothole",
                    "streetlight",
                    "garbage",
                    "water",
                    "roads",
                    "other",
                ],
                message: "{VALUE} is not a valid category",
            },
        },
        photos: [
            {
                type: String,
            },
        ],
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                required: [true, "Location coordinates are required"],
                validate: {
                    validator: function (v)
                    {
                        return (
                            v.length === 2 &&
                            v[0] >= -180 &&
                            v[0] <= 180 &&
                            v[1] >= -90 &&
                            v[1] <= 90
                        );
                    },
                    message: "Invalid coordinates. Must be [longitude, latitude]",
                },
            },
            address: {
                type: String,
                default: "",
            },
        },
        status: {
            type: String,
            enum: ["pending", "reported", "in-progress", "resolved", "closed"],
            default: "pending",
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        },
        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);


issueSchema.index({ location: "2dsphere" });

issueSchema.index({ title: "text", description: "text" });

// Virtual for upvote count
issueSchema.virtual("upvoteCount").get(function ()
{
    return (this.upvotes || []).length;
});


// Ensure virtuals are included when converting to JSON
issueSchema.set("toJSON", { virtuals: true });
issueSchema.set("toObject", { virtuals: true });

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
