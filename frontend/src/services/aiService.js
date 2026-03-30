import api from "@/services/api";


export const getAISuggestions = async (title, description, category) => {
  try {
    const response = await api.post("/ai/suggestions", {
      title,
      description,
      category,
    });
    return {
      success: true,
      suggestions: response.data.data,
      aiPowered: response.data.aiPowered,
    };
  } catch (error) {
    console.error("AI suggestions error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get suggestions",
    };
  }
};


export const analyzeImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/ai/analyze-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: response.data.success,
      analysis: response.data.data,
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to analyze image",
    };
  }
};


export const getDefaultSuggestions = async (category) => {
  try {
    const response = await api.get(`/ai/default-suggestions/${category}`);
    return {
      success: true,
      suggestions: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to get suggestions",
    };
  }
};
