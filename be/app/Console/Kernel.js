const cron = require('node-cron');

class Kernel {
    constructor() {
        this.tasks = [];
    }

    schedule() {
        // Example: Run a task every day at midnight
        // mimics $schedule->command('...')->dailyAt('00:00');
        cron.schedule('0 0 * * *', () => {
            console.log('Running daily maintenance task...');
            // Call logic here
        });

        console.log('✅ Scheduled Tasks Initialized');
    }
}

module.exports = new Kernel();
