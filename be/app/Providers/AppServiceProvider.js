const Kernel = require('../Console/Kernel');

class AppServiceProvider {
    register() {
        // Register services in container (if we had one)
    }

    boot() {
        // Boot services
        console.log('🚀 AppServiceProvider Booting...');

        // Start Schedule
        Kernel.schedule();
    }
}

module.exports = new AppServiceProvider();
