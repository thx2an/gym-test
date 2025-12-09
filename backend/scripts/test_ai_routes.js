const fs = require('fs');
const path = require('path');

async function testAIRoute() {
    try {
        const tokenPath = path.join(__dirname, '../token.txt');
        const token = fs.readFileSync(tokenPath, 'utf8').trim();
        const baseUrl = 'http://localhost:5000/api';

        console.log('Testing call to /api/ai/workout...');

        const res = await fetch(`${baseUrl}/ai/workout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                goal: "Build Muscle",
                duration: 4,
                experience: "Intermediate",
                age: 25,
                gender: "Male"
            })
        });

        console.log(`Status Code: ${res.status}`);
        const data = await res.json();

        if (res.ok) {
            console.log("✅ Success! Plan generated.");
            console.log("Plan Keys:", Object.keys(data.plan));
        } else {
            console.log("❌ Failure:", data);
        }

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testAIRoute();
