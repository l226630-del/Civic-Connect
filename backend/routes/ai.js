const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { protect } = require("../middleware/auth");
const { handleSingleUpload } = require("../middleware/upload");
const {
    getIssueSuggestions,
    analyzeIssueImage,
    getDefaultSuggestions,
} = require("../services/aiService");




router.post("/suggestions", protect, async (req, res) =>
{
    try
    {
        const { title, description, category } = req.body;

        if (!title || !category)
        {
            return res.status(400).json({
                success: false,
                message: "Title and category are required",
            });
        }

        const result = await getIssueSuggestions(
            title,
            description || "",
            category
        );

        res.json({
            success: true,
            data: result.suggestions,
            aiPowered: result.success,
        });
    } catch (error)
    {
        console.error("AI suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Error getting suggestions",
        });
    }
});




router.post("/analyze-image", protect, handleSingleUpload, async (req, res) =>
{
    try
    {
        if (!req.file)
        {
            return res.status(400).json({
                success: false,
                message: "Image file is required",
            });
        }

        const imagePath = path.join(__dirname, "../public/uploads", req.file.filename);
        const imageBuffer = fs.readFileSync(imagePath);
        const mimeType = req.file.mimetype;

        const result = await analyzeIssueImage(imageBuffer, mimeType);

        // Clean up the uploaded file after analysis
        fs.unlinkSync(imagePath);

        if (result.success)
        {
            res.json({
                success: true,
                data: result.analysis,
            });
        } else
        {
            res.json({
                success: false,
                message: result.message,
            });
        }
    } catch (error)
    {
        console.error("Image analysis error:", error);
        res.status(500).json({
            success: false,
            message: "Error analyzing image",
        });
    }
});




router.get("/default-suggestions/:category", (req, res) =>
{
    const { category } = req.params;
    const suggestions = getDefaultSuggestions(category);

    res.json({
        success: true,
        data: suggestions,
    });
});

module.exports = router;
