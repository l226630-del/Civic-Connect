require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");


const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir))
{
    fs.mkdirSync(uploadDir, { recursive: true });
}


const authRoutes = require("./routes/auth");
const issueRoutes = require("./routes/issues");
const departmentRoutes = require("./routes/departments");
const aiRoutes = require("./routes/ai");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");
const commentRoutes = require("./routes/comments");
const adminRoutes = require("./routes/admin");

const app = express();
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";


app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "https://civicconnect-production.up.railway.app",
                    "https:",
                    ...(isDev ? ["http:"] : []),
                ],
                connectSrc: [
                    "'self'",
                    "https:",
                    "wss:",
                    ...(isDev ? ["http:", "ws:"] : []),
                ],
            },
        },
    })
);


app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join(__dirname, "../frontend/dist")));


app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);


app.get("/api/health", (req, res) =>
{
    res.json({
        success: true,
        message: "CivicConnect API is running",
        timestamp: new Date().toISOString(),
    });
});

// Catch-all route to serve frontend SPA for non-API routes
// Express 5 requires named parameter for wildcards
app.get("/{*splat}", (req, res, next) =>
{

    if (req.path.startsWith("/api"))
    {
        return next();
    }

    if (
        req.path.match(
            /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/
        )
    )
    {
        return next();
    }
    // Serve the frontend for all other routes
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});


app.use((err, req, res, next) =>
{
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});


app.use((req, res) =>
{
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});


const server = app.listen(port, async () =>
{
    console.log(`Server started on http://localhost:${port}/`);

    await connectDB();
});


process.on("unhandledRejection", (err) =>
{
    console.log("Unhandled Rejection:", err.message);
});


process.on("uncaughtException", (err) =>
{
    console.log("Uncaught Exception:", err.message);
});
