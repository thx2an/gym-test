const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", apiKey ? apiKey.substring(0, 5) + "..." : "UNDEFINED");

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Testing gemini-1.5-flash with COMPLEX prompt...");

        const prompt = `
        You are an expert fitness trainer. Create a 4-week workout plan for a client with the following profile:
        - Age: 25
        - Gender: Male
        - Goal: Build Muscle
        - Experience: Intermediate
        
        Return the response strictly in JSON format with the following structure:
        { "weeks": [] }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("Response Preview:", response.text().substring(0, 200));
        console.log("SUCCESS");
    } catch (error) {
        console.error("Error Details:", JSON.stringify(error, null, 2));
        console.error("Error Message:", error.message);
    }
}

run();
