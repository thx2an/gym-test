const { sql, connectDB } = require('../src/config/db');

async function migrateSprint4() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Checking and performing migrations for Sprint 4...');

        // 1. ai_workout_plans
        console.log('Migrating ai_workout_plans...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_workout_plans')
            CREATE TABLE ai_workout_plans (
                plan_id BIGINT PRIMARY KEY IDENTITY(1,1),
                member_id BIGINT NOT NULL,
                goal NVARCHAR(255) NULL,
                duration_weeks INT NULL,
                plan_json NVARCHAR(MAX) NULL,
                source NVARCHAR(20) NOT NULL CHECK (source IN ('ai', 'pt')),
                created_at DATETIME NOT NULL DEFAULT GETDATE(),
                created_by BIGINT NULL,
                FOREIGN KEY (member_id) REFERENCES users(user_id),
                FOREIGN KEY (created_by) REFERENCES users(user_id)
            );
        `);

        // 2. ai_nutrition_plans
        console.log('Migrating ai_nutrition_plans...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_nutrition_plans')
            CREATE TABLE ai_nutrition_plans (
                nutrition_id BIGINT PRIMARY KEY IDENTITY(1,1),
                member_id BIGINT NOT NULL,
                daily_calories INT NULL,
                macro_json NVARCHAR(MAX) NULL,
                plan_json NVARCHAR(MAX) NULL,
                created_at DATETIME NOT NULL DEFAULT GETDATE(),
                created_by BIGINT NULL,
                FOREIGN KEY (member_id) REFERENCES users(user_id),
                FOREIGN KEY (created_by) REFERENCES users(user_id)
            );
        `);

        // 3. support_tickets
        console.log('Migrating support_tickets...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'support_tickets')
            CREATE TABLE support_tickets (
                ticket_id BIGINT PRIMARY KEY IDENTITY(1,1),
                user_id BIGINT NOT NULL,
                subject NVARCHAR(255) NOT NULL,
                status NVARCHAR(20) NOT NULL DEFAULT 'open', -- open, in_progress, closed
                priority NVARCHAR(20) NOT NULL DEFAULT 'medium',
                created_at DATETIME NOT NULL DEFAULT GETDATE(),
                updated_at DATETIME NOT NULL DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        `);

        // 4. ticket_messages
        console.log('Migrating ticket_messages...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ticket_messages')
            CREATE TABLE ticket_messages (
                message_id BIGINT PRIMARY KEY IDENTITY(1,1),
                ticket_id BIGINT NOT NULL,
                sender_id BIGINT NOT NULL,
                message NVARCHAR(MAX) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT GETDATE(),
                FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id),
                FOREIGN KEY (sender_id) REFERENCES users(user_id)
            );
        `);

        console.log('Sprint 4 Database Migration Completed Successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
}

migrateSprint4();
