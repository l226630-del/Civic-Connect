const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;


const getIssueSuggestions = async (title, description, category) => {
  if (!genAI) {
    return {
      success: false,
      message: "AI service not configured",
      suggestions: getDefaultSuggestions(category),
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a civic engagement assistant helping citizens report issues to local government. 
    
Based on the following civic issue report, provide helpful suggestions:

Title: ${title}
Category: ${category}
Description: ${description}

Please provide a JSON response with the following structure:
{
  "improvedTitle": "A clearer, more specific title for the issue",
  "improvedDescription": "An enhanced description with more relevant details",
  "suggestedDepartment": "The most relevant government department to handle this (e.g., Public Works, Water Department, Streets Department, Sanitation, etc.)",
  "priority": "low/medium/high based on urgency and public safety impact",
  "additionalTips": ["tip1", "tip2", "tip3"],
  "similarIssuesKeywords": ["keyword1", "keyword2"]
}

Only respond with valid JSON, no markdown or explanation.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        suggestions,
      };
    }

    return {
      success: false,
      message: "Could not parse AI response",
      suggestions: getDefaultSuggestions(category),
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);
    return {
      success: false,
      message: "AI service temporarily unavailable",
      suggestions: getDefaultSuggestions(category),
    };
  }
};


const analyzeIssueImage = async (imageBuffer, mimeType) => {
  if (!genAI) {
    return {
      success: false,
      message: "AI service not configured",
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType || "image/jpeg",
      },
    };

    const prompt = `Analyze this image of a potential civic issue (like a pothole, broken streetlight, garbage, etc.).
    
Provide a JSON response with:
{
  "issueDetected": true/false,
  "category": "pothole/streetlight/garbage/water/roads/other",
  "severity": "low/medium/high",
  "suggestedTitle": "Brief title describing the issue",
  "suggestedDescription": "Detailed description of what's visible in the image",
  "confidence": 0.0 to 1.0
}

Only respond with valid JSON.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        success: true,
        analysis: JSON.parse(jsonMatch[0]),
      };
    }

    return {
      success: false,
      message: "Could not analyze image",
    };
  } catch (error) {
    console.error("Image Analysis Error:", error.message);
    return {
      success: false,
      message: "Image analysis failed",
    };
  }
};


const generateIssuesSummary = async (issues) => {
  if (!genAI || !issues.length) {
    return {
      success: false,
      message: "AI service not configured or no issues provided",
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const issuesSummary = issues.map((i) => ({
      title: i.title,
      category: i.category,
      status: i.status,
      location: i.location?.address,
    }));

    const prompt = `Analyze these civic issues and provide insights:

${JSON.stringify(issuesSummary, null, 2)}

Provide a JSON response with:
{
  "totalCount": number,
  "categoryBreakdown": { "category": count },
  "hotspots": ["area1", "area2"],
  "trends": "Brief description of patterns",
  "recommendations": ["recommendation1", "recommendation2"],
  "urgentIssues": number
}

Only respond with valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        success: true,
        summary: JSON.parse(jsonMatch[0]),
      };
    }

    return {
      success: false,
      message: "Could not generate summary",
    };
  } catch (error) {
    console.error("Summary Generation Error:", error.message);
    return {
      success: false,
      message: "Summary generation failed",
    };
  }
};


const getDefaultSuggestions = (category) => {
  const categoryTips = {
    pothole: {
      suggestedDepartment: "Public Works Department",
      additionalTips: [
        "Include the approximate size of the pothole",
        "Mention if it's near an intersection or crosswalk",
        "Note any vehicle damage you've witnessed",
      ],
    },
    streetlight: {
      suggestedDepartment: "Electrical Department",
      additionalTips: [
        "Include the pole number if visible",
        "Describe if it's completely out or flickering",
        "Mention nearby landmarks for easy location",
      ],
    },
    garbage: {
      suggestedDepartment: "Sanitation Department",
      additionalTips: [
        "Specify if it's household waste or illegal dumping",
        "Mention any hazardous materials if visible",
        "Note how long the garbage has been there",
      ],
    },
    water: {
      suggestedDepartment: "Water Department",
      additionalTips: [
        "Describe the water pressure issues if any",
        "Mention if water appears discolored",
        "Note if it affects multiple households",
      ],
    },
    roads: {
      suggestedDepartment: "Streets Department",
      additionalTips: [
        "Mention specific road damage type",
        "Note traffic impact during peak hours",
        "Include nearby street names for context",
      ],
    },
    other: {
      suggestedDepartment: "General Services",
      additionalTips: [
        "Be as specific as possible about the issue",
        "Include photos if available",
        "Mention how it affects the community",
      ],
    },
  };

  return categoryTips[category] || categoryTips.other;
};

module.exports = {
  getIssueSuggestions,
  analyzeIssueImage,
  generateIssuesSummary,
  getDefaultSuggestions,
};
