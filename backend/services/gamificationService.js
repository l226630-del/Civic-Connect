const User = require("../models/User");
const Issue = require("../models/Issue");
const { notifyAchievement } = require("./notificationService");


const POINTS = {
  ISSUE_CREATED: 10,
  ISSUE_RESOLVED: 25,
  RECEIVED_UPVOTE: 2,
  GAVE_UPVOTE: 1,
  COMMENT_ADDED: 3,
  FIRST_ISSUE: 50,
  STREAK_BONUS: 15,
};


const ACHIEVEMENTS = {
  FIRST_REPORT: {
    id: "first_report",
    name: "First Step",
    description: "Report your first civic issue",
    icon: "🎯",
    points: 50,
    condition: (stats) => stats.issuesCreated >= 1,
  },
  ACTIVE_CITIZEN: {
    id: "active_citizen",
    name: "Active Citizen",
    description: "Report 5 civic issues",
    icon: "🏃",
    points: 100,
    condition: (stats) => stats.issuesCreated >= 5,
  },
  COMMUNITY_CHAMPION: {
    id: "community_champion",
    name: "Community Champion",
    description: "Report 25 civic issues",
    icon: "🏆",
    points: 500,
    condition: (stats) => stats.issuesCreated >= 25,
  },
  PROBLEM_SOLVER: {
    id: "problem_solver",
    name: "Problem Solver",
    description: "Have 5 of your issues resolved",
    icon: "✅",
    points: 150,
    condition: (stats) => stats.issuesResolved >= 5,
  },
  INFLUENCER: {
    id: "influencer",
    name: "Influencer",
    description: "Receive 50 upvotes on your issues",
    icon: "⭐",
    points: 200,
    condition: (stats) => stats.upvotesReceived >= 50,
  },
  VIRAL_REPORTER: {
    id: "viral_reporter",
    name: "Viral Reporter",
    description: "Have a single issue receive 25 upvotes",
    icon: "🔥",
    points: 250,
    condition: (stats) => stats.maxUpvotesOnSingleIssue >= 25,
  },
  SUPPORTER: {
    id: "supporter",
    name: "Supporter",
    description: "Upvote 20 issues from other citizens",
    icon: "👍",
    points: 75,
    condition: (stats) => stats.upvotesGiven >= 20,
  },
  EARLY_BIRD: {
    id: "early_bird",
    name: "Early Bird",
    description: "Report an issue within the first week of joining",
    icon: "🐦",
    points: 30,
    condition: (stats) => stats.reportedWithinFirstWeek,
  },
  CATEGORY_EXPERT: {
    id: "category_expert",
    name: "Category Expert",
    description: "Report 10 issues in the same category",
    icon: "🎓",
    points: 100,
    condition: (stats) => stats.maxIssuesInCategory >= 10,
  },
  STREAK_MASTER: {
    id: "streak_master",
    name: "Streak Master",
    description: "Report issues for 7 consecutive days",
    icon: "🔥",
    points: 150,
    condition: (stats) => stats.maxStreak >= 7,
  },
};


const awardPoints = async (userId, points, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.points = (user.points || 0) + points;
    await user.save();

    return user.points;
  } catch (error) {
    console.error("Error awarding points:", error);
    return null;
  }
};


const getUserStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    
    const userIssues = await Issue.find({ creator: userId });

    
    const issuesCreated = userIssues.length;
    const issuesResolved = userIssues.filter(
      (i) => i.status === "resolved" || i.status === "closed"
    ).length;

    
    const upvotesReceived = userIssues.reduce(
      (sum, issue) => sum + (issue.upvotes?.length || 0),
      0
    );

    
    const maxUpvotesOnSingleIssue = Math.max(
      0,
      ...userIssues.map((i) => i.upvotes?.length || 0)
    );

    
    const upvotesGiven = await Issue.countDocuments({
      upvotes: userId,
      creator: { $ne: userId },
    });

    
    const firstIssue = userIssues.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )[0];
    const reportedWithinFirstWeek =
      firstIssue &&
      new Date(firstIssue.createdAt) - new Date(user.createdAt) <=
        7 * 24 * 60 * 60 * 1000;

    
    const categoryCounts = {};
    userIssues.forEach((issue) => {
      categoryCounts[issue.category] =
        (categoryCounts[issue.category] || 0) + 1;
    });
    const maxIssuesInCategory = Math.max(0, ...Object.values(categoryCounts));

    
    const maxStreak = calculateStreak(userIssues);

    return {
      issuesCreated,
      issuesResolved,
      upvotesReceived,
      maxUpvotesOnSingleIssue,
      upvotesGiven,
      reportedWithinFirstWeek,
      maxIssuesInCategory,
      maxStreak,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
};


const calculateStreak = (issues) => {
  if (!issues.length) return 0;

  const dates = issues
    .map((i) => new Date(i.createdAt).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(a) - new Date(b));

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
};


const checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const stats = await getUserStats(userId);
    if (!stats) return [];

    const currentAchievements = user.achievements || [];
    const newAchievements = [];

    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      
      if (currentAchievements.includes(achievement.id)) continue;

      
      if (achievement.condition(stats)) {
        newAchievements.push(achievement);
        currentAchievements.push(achievement.id);

        
        user.points = (user.points || 0) + achievement.points;

        
        await notifyAchievement(userId, achievement.name, achievement.points);
      }
    }

    if (newAchievements.length > 0) {
      user.achievements = currentAchievements;
      await user.save();
    }

    return newAchievements;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
};


const getLeaderboard = async (limit = 20, timeframe = "all") => {
  try {
    let dateFilter = {};

    if (timeframe === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (timeframe === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    const leaderboard = await User.find({
      role: "citizen",
      ...dateFilter,
    })
      .select("username profilePhoto points achievements createdAt")
      .sort({ points: -1 })
      .limit(limit);

    
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (user, index) => {
        const issueCount = await Issue.countDocuments({ creator: user._id });
        const resolvedCount = await Issue.countDocuments({
          creator: user._id,
          status: { $in: ["resolved", "closed"] },
        });

        return {
          rank: index + 1,
          _id: user._id,
          username: user.username,
          profilePhoto: user.profilePhoto,
          points: user.points || 0,
          achievements: user.achievements || [],
          issueCount,
          resolvedCount,
        };
      })
    );

    return enrichedLeaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
};


const getUserRank = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const rank = await User.countDocuments({
      role: "citizen",
      points: { $gt: user.points || 0 },
    });

    return rank + 1;
  } catch (error) {
    console.error("Error getting user rank:", error);
    return null;
  }
};

module.exports = {
  POINTS,
  ACHIEVEMENTS,
  awardPoints,
  getUserStats,
  checkAchievements,
  getLeaderboard,
  getUserRank,
};
