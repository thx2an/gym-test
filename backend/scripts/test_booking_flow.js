const fs = require('fs');
const path = require('path');

async function testBooking() {
    try {
        const tokenPath = path.join(__dirname, '../token.txt');
        const token = fs.readFileSync(tokenPath, 'utf8').trim();
        const baseUrl = 'http://localhost:5000/api';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('1. Checking Availability');
        // Trainer ID 1, Date = Tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const slotsRes = await fetch(`${baseUrl}/booking/slots?trainerId=1&date=${dateStr}`, { headers });
        const slots = await slotsRes.json();
        console.log(`Found ${slots.length} slots.`);

        if (slots.length > 0) {
            const slot = slots[0];
            console.log(`2. Booking slot: ${slot.datetime}`);

            const bookRes = await fetch(`${baseUrl}/booking/book`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    trainerId: 1,
                    startTime: slot.datetime,
                    notes: 'Test Booking Script'
                })
            });
            const bookData = await bookRes.json();
            console.log('Booking Result:', bookData);

            console.log('3. Fetching My Bookings');
            const myRes = await fetch(`${baseUrl}/booking/my-bookings`, { headers });
            const myBookings = await myRes.json();
            console.log('My Bookings:', myBookings);

            if (myBookings.length > 0) {
                console.log('✅ Success: Booking found');
            } else {
                console.log('❌ Failure: Booking not found in list');
            }

        } else {
            console.log('No slots to book.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testBooking();
