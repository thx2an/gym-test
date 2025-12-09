const { sql } = require('../config/db');
const { generateWorkoutPlan, generateNutritionPlan } = require('../services/geminiService');

const createWorkoutPlan = async (req, res) => {
    try {
        const { goal, duration, experience, age, gender } = req.body;
        const userId = req.user.id; // From verifyToken

        // 1. Call Gemini Service
        // Construct a profile object
        const userProfile = { age, gender, experience };
        const planData = await generateWorkoutPlan(userProfile, goal, duration);

        // 2. Save to Database
        const pool = await sql.connect();
        const planJson = JSON.stringify(planData);

        await pool.request()
            .input('uid', sql.BigInt, userId)
            .input('goal', sql.NVarChar, goal)
            .input('dur', sql.Int, duration)
            .input('json', sql.NVarChar, planJson)
            .query(`
                INSERT INTO ai_workout_plans (member_id, goal, duration_weeks, plan_json, source, created_by)
                VALUES (@uid, @goal, @dur, @json, 'ai', @uid)
            `);

        res.json({ message: 'Plan created successfully', plan: planData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate plan' });
    }
};

const createNutritionPlan = async (req, res) => {
    try {
        const { goal, dietaryPreference } = req.body; // e.g., Vegan, Keto
        const userId = req.user.id;

        // 1. Call Gemini Service
        // We can pass preference as part of goal string or modify service to accept it
        const fullGoal = `${goal} (${dietaryPreference || 'No preference'})`;
        const planData = await generateNutritionPlan({}, fullGoal);

        // 2. Save to Database
        const pool = await sql.connect();
        const planJson = JSON.stringify(planData);

        await pool.request()
            .input('uid', sql.BigInt, userId)
            .input('cals', sql.Int, planData.daily_calories || 0)
            .input('json', sql.NVarChar, planJson)
            .query(`
                INSERT INTO ai_nutrition_plans (member_id, daily_calories, plan_json, created_by)
                VALUES (@uid, @cals, @json, @uid)
            `);

        res.json({ message: 'Nutrition plan created successfully', plan: planData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate nutrition plan' });
    }
};

const getMyPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await sql.connect();

        const workoutRes = await pool.request().input('uid', sql.BigInt, userId)
            .query("SELECT * FROM ai_workout_plans WHERE member_id = @uid ORDER BY created_at DESC");

        const nutritionRes = await pool.request().input('uid', sql.BigInt, userId)
            .query("SELECT * FROM ai_nutrition_plans WHERE member_id = @uid ORDER BY created_at DESC");

        res.json({
            workouts: workoutRes.recordset,
            nutrition: nutritionRes.recordset
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createWorkoutPlan, createNutritionPlan, getMyPlans };
