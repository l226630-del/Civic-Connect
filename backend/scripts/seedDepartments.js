require("dotenv").config();
const mongoose = require("mongoose");
const Department = require("../models/Department");

const departments = [
  {
    name: "Roads & Infrastructure",
    description:
      "Handles road maintenance, potholes, traffic signals, and infrastructure issues",
    email: "roads@civicconnect.com",
    phone: "555-0101",
    categories: ["roads", "infrastructure", "traffic"],
  },
  {
    name: "Sanitation",
    description:
      "Manages waste collection, garbage disposal, and cleanliness issues",
    email: "sanitation@civicconnect.com",
    phone: "555-0102",
    categories: ["sanitation", "garbage", "waste"],
  },
  {
    name: "Electricity",
    description:
      "Handles power outages, street lighting, and electrical infrastructure",
    email: "electricity@civicconnect.com",
    phone: "555-0103",
    categories: ["electricity", "lighting"],
  },
  {
    name: "Water Supply",
    description:
      "Manages water supply, drainage, sewage, and water quality issues",
    email: "water@civicconnect.com",
    phone: "555-0104",
    categories: ["water", "drainage", "sewage"],
  },
  {
    name: "Parks & Recreation",
    description:
      "Maintains public parks, playgrounds, and recreational facilities",
    email: "parks@civicconnect.com",
    phone: "555-0105",
    categories: ["parks", "recreation", "public-spaces"],
  },
  {
    name: "Public Safety",
    description:
      "Handles safety concerns, hazards, and emergency-related issues",
    email: "safety@civicconnect.com",
    phone: "555-0106",
    categories: ["safety", "emergency", "hazards"],
  },
];

const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    // Check existing departments
    const existingCount = await Department.countDocuments();

    if (existingCount > 0) {
      console.log(`${existingCount} departments already exist.`);
      const answer = process.argv.includes("--force");

      if (!answer) {
        console.log("Use --force flag to recreate departments");
        process.exit(0);
      }

      await Department.deleteMany({});
      console.log("Existing departments deleted.");
    }

    // Create departments
    const created = await Department.insertMany(departments);

    console.log(`\n${created.length} departments created successfully!\n`);
    created.forEach((dept) => {
      console.log(`  ✓ ${dept.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding departments:", error.message);
    process.exit(1);
  }
};

seedDepartments();
