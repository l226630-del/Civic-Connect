require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@civicconnect.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log("  Email: admin@civicconnect.com");
      console.log("  Password: Admin@123");
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: "admin",
      email: "admin@civicconnect.com",
      password: "Admin@123",
      role: "admin",
      bio: "System Administrator",
      points: 1000,
    });

    console.log("Admin user created successfully!");
    console.log("  Email: admin@civicconnect.com");
    console.log("  Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
