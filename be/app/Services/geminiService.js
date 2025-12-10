const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Access your API key as an environment variable (GEMINI_API_KEY)
const apiKey = process.env.GEMINI_API_KEY;
console.log("GEMINI Service Key:", apiKey ? apiKey.substring(0, 5) + "..." : "UNDEFINED");
const genAI = new GoogleGenerativeAI(apiKey);

const generateWorkoutPlan = async (userProfile, goal, durationWeeks) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            You are an expert fitness trainer. Create a ${durationWeeks}-week workout plan for a client with the following profile:
            - Age: ${userProfile.age || 'N/A'}
            - Gender: ${userProfile.gender || 'N/A'}
            - Goal: ${goal}
            - Experience: ${userProfile.experience || 'Beginner'}
            
            Return the response strictly in JSON format with the following structure:
            {
                "weeks": [
                    {
                        "week_number": 1,
                        "days": [
                            {
                                "day": "Monday",
                                "focus": "Legs",
                                "exercises": [
                                    { "name": "Squat", "sets": 3, "reps": "10-12" }
                                ]
                            }
                        ]
                    }
                ],
                "tips": ["Tip 1", "Tip 2"]
            }
            Do not include any markdown formatting or explanations outside the JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Clean up markdown code blocks if present
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Error Details:", JSON.stringify(error, null, 2));
        console.error("Gemini Error Message:", error.message);
        throw new Error("Failed to generate workout plan");
    }
};

const generateNutritionPlan = async (userProfile, goal) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            You are an expert nutritionist. Create a daily nutrition plan for:
            - Goal: ${goal}
            
            Return the response strictly in JSON format:
            {
                "daily_calories": 2500,
                "macros": { "protein": "200g", "carbs": "300g", "fats": "80g" },
                "meals": [
                    { "name": "Breakfast", "items": ["Oats", "Eggs"] }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Nutrition Error Details:", JSON.stringify(error, null, 2));
        console.error("Gemini Nutrition Error Message:", error.message);
        throw new Error("Failed to generate nutrition plan");
    }
};

module.exports = { generateWorkoutPlan, generateNutritionPlan };
