const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
    constructor() {
        // Initialize with API Key (make sure .env has GEMINI_API_KEY)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "TEST_KEY");
        this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async generateWorkoutPlan(userProfile) {
        if (!process.env.GEMINI_API_KEY) return "Simulation: Gemini API Key missing. Workout Plan for " + userProfile.goal;

        const prompt = `Create a workout plan for a ${userProfile.gender} user, ${userProfile.age} years old, weighing ${userProfile.weight}kg, with the goal of ${userProfile.goal}.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Error:", error);
            return "Error generating plan. Please try again later.";
        }
    }

    async generateNutritionPlan(userProfile) {
        if (!process.env.GEMINI_API_KEY) return "Simulation: Gemini API Key missing. Nutrition Plan for " + userProfile.goal;
        // Implementation similar to workout
        return "Eat healthy.";
    }
}

module.exports = new GeminiService();
