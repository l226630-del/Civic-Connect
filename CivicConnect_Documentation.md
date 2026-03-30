# CivicConnect - Project Documentation

---

## Table of Contents

1. [What is CivicConnect?](#what-is-civicconnect)
2. [Why We Built This Project](#why-we-built-this-project)
3. [Main Features](#main-features)
4. [How It Works](#how-it-works)
5. [Technologies We Used](#technologies-we-used)
6. [Challenges We Faced](#challenges-we-faced)
7. [The Final Product](#the-final-product)
8. [How to Run the Project](#how-to-run-the-project)
9. [Conclusion](#conclusion)

---

## What is CivicConnect?

**CivicConnect** is a web application that helps citizens report problems in their city and connect with local government authorities. Think of it like a bridge between people and the city government.

For example, if you see:
- A pothole on the road
- A broken streetlight
- Garbage not being collected
- Water supply problems

You can report it on CivicConnect with photos and your location. The city authorities will see your report and work to fix the problem. You can track the progress of your complaint until it gets resolved.

---

## Why We Built This Project

We built CivicConnect because:

1. **Communication Gap**: Citizens often don't know how to report city problems to the right department.

2. **No Tracking**: When people report issues, they usually don't know if anyone is working on them.

3. **Lack of Transparency**: There's no easy way to see what problems exist in different areas and how the government is handling them.

4. **Community Engagement**: People want to be involved in making their city better.

CivicConnect solves all these problems by providing one simple platform for everyone.

---

## Main Features

### For Citizens (Regular Users)

| Feature | Description |
|---------|-------------|
| **Report Issues** | Submit problems with photos and location on a map |
| **Track Progress** | See if your issue is pending, in-progress, or resolved |
| **Upvote Issues** | Support issues reported by others |
| **Comment** | Add comments and discuss issues with other citizens |
| **User Dashboard** | See all your reported issues in one place |
| **Notifications** | Get updates when your issue status changes |
| **Leaderboard** | Earn points for reporting issues and helping the community |
| **AI Suggestions** | Get smart suggestions to avoid duplicate reports |
| **Share Issues** | Share reports on WhatsApp and download PDF reports |

### For Administrators (City Officials)

| Feature | Description |
|---------|-------------|
| **Admin Dashboard** | Overview of all issues in the city |
| **Manage Issues** | Update status and assign issues to departments |
| **Department Management** | Create and manage city departments |
| **User Management** | View and manage registered users |
| **Analytics** | See charts and statistics about issues |

---

## How It Works

### Step 1: Registration
Users create an account with their name, email, and password.

### Step 2: Login
Users log in to access the platform.

### Step 3: Report an Issue
1. Click "Create Issue"
2. Enter a title and description
3. Select a category (pothole, streetlight, garbage, etc.)
4. Add photos of the problem
5. Mark the location on the map
6. Submit the report

### Step 4: Track and Engage
- View your issues on your dashboard
- See status updates
- Comment on issues
- Upvote important issues

### Step 5: Resolution
- City officials review the issue
- They assign it to the right department
- The department fixes the problem
- Status is updated to "Resolved"
- You get notified

---

## Technologies We Used

### Frontend (What Users See)

| Technology | Purpose |
|------------|---------|
| **React.js** | Building the user interface |
| **Redux Toolkit** | Managing application data |
| **Tailwind CSS** | Styling the pages |
| **Shadcn UI** | Pre-built beautiful components |
| **React Router** | Navigation between pages |
| **Axios** | Talking to the backend server |
| **Recharts** | Creating charts for analytics |
| **Google Maps API** | Showing locations on maps |
| **jsPDF** | Creating PDF reports |

### Backend (Server Side)

| Technology | Purpose |
|------------|---------|
| **Node.js** | Running JavaScript on the server |
| **Express.js** | Creating the API server |
| **MongoDB** | Storing all the data |
| **Mongoose** | Working with the database easily |
| **JWT** | Secure user authentication |
| **Bcrypt** | Encrypting passwords |
| **Multer** | Handling file uploads (photos) |
| **Google Gemini AI** | Smart issue categorization |

### Other Tools

| Tool | Purpose |
|------|---------|
| **Vite** | Fast development server |
| **Git & GitHub** | Version control and collaboration |
| **Render** | Hosting the application online |
| **MongoDB Atlas** | Cloud database hosting |

---

## Challenges We Faced

### Challenge 1: Database Connection Issues
**Problem**: MongoDB connection kept failing with "EREFUSED" errors.

**Solution**: We made sure our IP address was whitelisted in MongoDB Atlas and added proper error handling for connection retries.

---

### Challenge 2: File Upload Problems
**Problem**: Users couldn't upload photos properly. The images were not saving correctly.

**Solution**: We configured Multer correctly with proper file size limits, allowed image types, and set up the correct storage path for uploaded files.

---

### Challenge 3: Authentication Security
**Problem**: Making sure user accounts are secure and only authorized users can access certain features.

**Solution**: We used JWT (JSON Web Tokens) for authentication, bcrypt for password hashing, and created middleware to protect routes based on user roles.

---

### Challenge 4: Map Integration
**Problem**: Getting Google Maps to work properly for location selection and display.

**Solution**: We integrated the @react-google-maps/api library and handled API key configuration. Users can now click on the map to select their location or use their current location.

---

### Challenge 5: Real-time Notifications
**Problem**: Users needed to know when their issue status changed without refreshing the page.

**Solution**: We implemented a polling system that checks for new notifications every 30 seconds. When new notifications arrive, users see them in the notification dropdown.

---

### Challenge 6: State Management Complexity
**Problem**: Managing data across different parts of the application was getting complicated.

**Solution**: We used Redux Toolkit with separate slices for auth, issues, departments, and notifications. This made the code organized and easier to maintain.

---

### Challenge 7: Responsive Design
**Problem**: Making the application work well on phones, tablets, and computers.

**Solution**: We used Tailwind CSS responsive classes and Shadcn UI components which are already mobile-friendly. The sidebar converts to a hamburger menu on mobile devices.

---

### Challenge 8: Virtual Field Errors
**Problem**: We got errors like "Cannot read properties of undefined (reading 'length')" in the Issue model.

**Solution**: We added null checks to virtual fields in the Mongoose schema to handle cases where arrays might be undefined.

---

### Challenge 9: PDF Generation
**Problem**: Creating professional-looking PDF reports for issues was challenging.

**Solution**: We used jsPDF library to generate beautifully formatted PDF documents with proper styling, colors, and layout.

---

### Challenge 10: AI Integration
**Problem**: Adding AI features for smart issue categorization and duplicate detection.

**Solution**: We integrated Google's Gemini AI API to analyze issue descriptions and suggest appropriate categories, and to find similar existing issues based on location and content.

---

## The Final Product

### What We Built

CivicConnect is now a fully working web application with:

#### User Features:
- ✅ Beautiful login and registration pages
- ✅ User dashboard showing personal issues and stats
- ✅ Issue creation with photo upload and map location
- ✅ Issue listing with search and filters
- ✅ Issue detail page with comments
- ✅ Upvoting system for issues
- ✅ Notification system
- ✅ User profile with points and achievements
- ✅ Leaderboard showing top contributors
- ✅ PDF download and WhatsApp sharing
- ✅ AI-powered suggestions

#### Admin Features:
- ✅ Admin dashboard with overview statistics
- ✅ Manage all issues (update status, assign department)
- ✅ Department management (create, edit, delete)
- ✅ User management
- ✅ Analytics with charts and graphs

#### Technical Achievements:
- ✅ Secure authentication system
- ✅ RESTful API design
- ✅ Clean and organized code structure
- ✅ Responsive design for all devices
- ✅ Database with proper relationships
- ✅ File upload system
- ✅ Error handling
- ✅ Loading states with skeletons

### Screenshots of Pages

The application includes these main pages:
1. **Home Page** - Welcome screen with login/register options
2. **Login Page** - User authentication
3. **Register Page** - New user registration
4. **User Dashboard** - Personal overview and quick actions
5. **Issues List** - Browse all reported issues
6. **Create Issue** - Form to report new problems
7. **Issue Detail** - Full information about an issue with comments
8. **Profile Page** - User information and settings
9. **Leaderboard** - Rankings of top contributors
10. **Notifications** - List of all notifications
11. **Admin Dashboard** - Overview for administrators
12. **Department Management** - Manage city departments
13. **User Management** - Manage registered users
14. **Analytics** - Charts and statistics

---

## How to Run the Project

### Requirements
- Node.js (version 18 or higher)
- pnpm or npm package manager
- MongoDB Atlas account (or local MongoDB)
- Google Maps API key
- Google Gemini API key

### Step 1: Clone the Project
```bash
git clone https://github.com/afk-abdul/CivicConnect.git
cd CivicConnect
```

### Step 2: Setup Backend
```bash
cd backend
pnpm install
```

Create a `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

### Step 3: Setup Frontend
```bash
cd frontend
pnpm install
```

Create a `.env.local` file with:
```
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Step 4: Seed the Database
```bash
cd backend
pnpm run seed:all
```

This creates an admin user and default departments.

### Step 5: Run the Application
```bash
# Terminal 1 - Backend
cd backend
pnpm run dev

# Terminal 2 - Frontend
cd frontend
pnpm run dev
```

### Step 6: Open in Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Default Admin Login
- Email: admin@civicconnect.com
- Password: Admin@123

---

## Conclusion

CivicConnect is a complete civic engagement platform that successfully bridges the gap between citizens and local government authorities. 

**What makes it special:**

1. **Easy to Use** - Simple interface for reporting problems
2. **Transparent** - Track issue status from start to finish
3. **Engaging** - Gamification with points and achievements
4. **Smart** - AI-powered suggestions and duplicate detection
5. **Mobile Friendly** - Works on all devices
6. **Secure** - Protected user accounts and data
7. **Professional** - Modern design with quality UI components

The project demonstrates practical use of modern web technologies including React, Node.js, MongoDB, and AI integration to solve a real-world problem of civic communication.

We hope CivicConnect helps communities become more connected and empowers citizens to actively participate in improving their neighborhoods.

---

**Project Repository**: https://github.com/afk-abdul/CivicConnect

**Developers**: CivicConnect Team

**Date**: December 2025

---

*End of Documentation*
