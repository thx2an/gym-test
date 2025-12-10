import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AIPlanner = () => {
    const [activeTab, setActiveTab] = useState('workout'); // workout | nutrition
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Workout Form
    const [wGoal, setWGoal] = useState('Build Muscle');
    const [wDuration, setWDuration] = useState(4);
    const [wExperience, setWExperience] = useState('Intermediate');

    // Nutrition Form
    const [nGoal, setNGoal] = useState('Lose Weight');
    const [nDiet, setNDiet] = useState('None');

    const handleGenerateWorkout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await axiosClient.post('/ai/workout', {
                goal: wGoal,
                duration: wDuration,
                experience: wExperience,
                // Hardcode age/gender for now or fetch from profile
                age: 25,
                gender: 'Male'
            });
            setResult(res.data.plan);
        } catch (error) {
            alert('Failed to generate plan');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateNutrition = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await axiosClient.post('/ai/nutrition', {
                goal: nGoal,
                dietaryPreference: nDiet
            });
            setResult(res.data.plan);
        } catch (error) {
            alert('Failed to generate plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">GymNexus AI Coach 🤖</h1>

            <div className="flex border-b mb-6">
                <button
                    className={`px-6 py-3 font-semibold ${activeTab === 'workout' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                    onClick={() => { setActiveTab('workout'); setResult(null); }}
                >
                    Workout Planner
                </button>
                <button
                    className={`px-6 py-3 font-semibold ${activeTab === 'nutrition' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-green-500'}`}
                    onClick={() => { setActiveTab('nutrition'); setResult(null); }}
                >
                    Nutrition Planner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Input Column */}
                <div className="md:col-span-1 bg-white p-6 rounded shadow h-fit">
                    {activeTab === 'workout' ? (
                        <form onSubmit={handleGenerateWorkout}>
                            <h3 className="font-bold text-lg mb-4">Workout Settings</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Goal</label>
                                <select className="w-full border p-2 rounded" value={wGoal} onChange={(e) => setWGoal(e.target.value)}>
                                    <option>Build Muscle</option>
                                    <option>Lose Fat</option>
                                    <option>Increase Strength</option>
                                    <option>Endurance</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Duration (Weeks)</label>
                                <input type="number" min="1" max="12" className="w-full border p-2 rounded" value={wDuration} onChange={(e) => setWDuration(e.target.value)} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Experience</label>
                                <select className="w-full border p-2 rounded" value={wExperience} onChange={(e) => setWExperience(e.target.value)}>
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                            <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                                {loading ? 'Generating...' : 'Generate Plan'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleGenerateNutrition}>
                            <h3 className="font-bold text-lg mb-4">Nutrition Settings</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Goal</label>
                                <select className="w-full border p-2 rounded" value={nGoal} onChange={(e) => setNGoal(e.target.value)}>
                                    <option>Lose Weight</option>
                                    <option>Maintain Weight</option>
                                    <option>Gain Muscle</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Diet Preference</label>
                                <select className="w-full border p-2 rounded" value={nDiet} onChange={(e) => setNDiet(e.target.value)}>
                                    <option>None</option>
                                    <option>Vegetarian</option>
                                    <option>Vegan</option>
                                    <option>Keto</option>
                                    <option>Paleo</option>
                                </select>
                            </div>
                            <button disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50">
                                {loading ? 'Computing...' : 'Create Meal Plan'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Result Column */}
                <div className="md:col-span-2 bg-gray-50 p-6 rounded shadow border min-h-[400px]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-500">Asking AI...</p>
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <span className="text-4xl mb-2">💡</span>
                            <p>Configure settings and click generate to see your AI plan here.</p>
                        </div>
                    )}

                    {!loading && result && activeTab === 'workout' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Your Workout Plan</h2>
                            {result.tips && (
                                <div className="bg-yellow-50 p-4 rounded mb-4 text-sm text-yellow-800 border border-yellow-200">
                                    <strong>Tips:</strong>
                                    <ul className="list-disc ml-5 mt-1">
                                        {result.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </div>
                            )}
                            <div className="space-y-4">
                                {result.weeks?.map((week) => (
                                    <div key={week.week_number} className="bg-white p-4 rounded border">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">Week {week.week_number}</h3>
                                        <div className="grid gap-4">
                                            {week.days?.map((day, idx) => (
                                                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-1">
                                                    <div className="font-semibold">{day.day} - {day.focus}</div>
                                                    <ul className="text-sm text-gray-600 mt-1">
                                                        {day.exercises?.map((ex, k) => (
                                                            <li key={k}>• {ex.name}: {ex.sets} sets x {ex.reps}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && result && activeTab === 'nutrition' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Your Nutrition Plan</h2>
                            <div className="bg-green-50 p-4 rounded mb-6 border border-green-200 flex justify-between items-center">
                                <div>
                                    <span className="block text-sm text-green-800 uppercase font-bold">Daily Target</span>
                                    <span className="text-3xl font-bold text-green-700">{result.daily_calories} kcal</span>
                                </div>
                                <div className="text-right text-sm">
                                    <div>Protein: <strong>{result.macros?.protein}</strong></div>
                                    <div>Carbs: <strong>{result.macros?.carbs}</strong></div>
                                    <div>Fats: <strong>{result.macros?.fats}</strong></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {result.meals?.map((meal, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded border shadow-sm flex items-start">
                                        <div className="bg-green-100 text-green-800 font-bold p-2 rounded mr-4 min-w-[100px] text-center">
                                            {meal.name}
                                        </div>
                                        <div>
                                            <ul className="list-disc ml-4 text-gray-700">
                                                {meal.items?.map((item, k) => <li key={k}>{item}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIPlanner;
