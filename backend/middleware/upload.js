const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir))
{
    fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb)
    {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});


const fileFilter = (req, file, cb) =>
{
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype)
    {
        return cb(null, true);
    } else
    {
        cb(
            new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"),
            false
        );
    }
};


const uploadSingle = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: fileFilter,
}).single("image");


const uploadMultiple = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
    },
    fileFilter: fileFilter,
}).array("images", 5);

// Middleware wrapper for single upload
const handleSingleUpload = (req, res, next) =>
{
    uploadSingle(req, res, function (err)
    {
        if (err instanceof multer.MulterError)
        {
            if (err.code === "LIMIT_FILE_SIZE")
            {
                return res.status(400).json({
                    success: false,
                    message: "File size cannot exceed 5MB",
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        } else if (err)
        {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        next();
    });
};

// Middleware wrapper for multiple upload
const handleMultipleUpload = (req, res, next) =>
{
    uploadMultiple(req, res, function (err)
    {
        if (err instanceof multer.MulterError)
        {
            if (err.code === "LIMIT_FILE_SIZE")
            {
                return res.status(400).json({
                    success: false,
                    message: "Each file size cannot exceed 5MB",
                });
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE")
            {
                return res.status(400).json({
                    success: false,
                    message: "Maximum 5 images allowed",
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        } else if (err)
        {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        next();
    });
};

module.exports = { handleSingleUpload, handleMultipleUpload };
