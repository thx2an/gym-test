const { sql, connectDB } = require('../src/config/db');

async function migrateSprint3() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Checking and performing migrations for Sprint 3...');

        // 1. trainer_profiles
        console.log('Migrating trainer_profiles...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'trainer_profiles')
            CREATE TABLE trainer_profiles (
                trainer_id BIGINT PRIMARY KEY IDENTITY(1,1),
                user_id BIGINT NOT NULL UNIQUE,
                specialization NVARCHAR(200) NULL,
                bio NVARCHAR(MAX) NULL,
                experience_years INT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        `);

        // 2. trainer_availability
        console.log('Migrating trainer_availability...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'trainer_availability')
            CREATE TABLE trainer_availability (
                availability_id BIGINT PRIMARY KEY IDENTITY(1,1),
                trainer_id BIGINT NOT NULL,
                branch_id INT NOT NULL,
                date DATE NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                is_recurring BIT NOT NULL DEFAULT 0,
                day_of_week TINYINT NULL,
                is_blocked BIT NOT NULL DEFAULT 0,
                FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(trainer_id),
                FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
            );
        `);

        // 3. training_sessions
        console.log('Migrating training_sessions...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'training_sessions')
            CREATE TABLE training_sessions (
                session_id BIGINT PRIMARY KEY IDENTITY(1,1),
                member_id BIGINT NOT NULL,
                trainer_id BIGINT NOT NULL,
                branch_id INT NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed')),
                notes NVARCHAR(MAX) NULL,
                created_at DATETIME NOT NULL DEFAULT GETDATE(),
                FOREIGN KEY (member_id) REFERENCES users(user_id),
                FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(trainer_id),
                FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
            );
        `);

        // 4. session_notes
        console.log('Migrating session_notes...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'session_notes')
            CREATE TABLE session_notes (
                note_id BIGINT PRIMARY KEY IDENTITY(1,1),
                session_id BIGINT NOT NULL,
                trainer_id BIGINT NOT NULL,
                member_id BIGINT NOT NULL,
                notes NVARCHAR(MAX) NULL,
                metrics_json NVARCHAR(MAX) NULL,
                created_at DATETIME NOT NULL DEFAULT GETDATE(),
                FOREIGN KEY (session_id) REFERENCES training_sessions(session_id),
                FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(trainer_id),
                FOREIGN KEY (member_id) REFERENCES users(user_id)
            );
        `);

        // 5. session_qr_tokens
        console.log('Migrating session_qr_tokens...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'session_qr_tokens')
            CREATE TABLE session_qr_tokens (
                qr_id BIGINT PRIMARY KEY IDENTITY(1,1),
                session_id BIGINT NOT NULL,
                token NVARCHAR(255) NOT NULL UNIQUE,
                generated_at DATETIME NOT NULL,
                expires_at DATETIME NOT NULL,
                is_used BIT NOT NULL DEFAULT 0,
                FOREIGN KEY (session_id) REFERENCES training_sessions(session_id)
            );
        `);

        // 6. checkins
        console.log('Migrating checkins...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'checkins')
            CREATE TABLE checkins (
                checkin_id BIGINT PRIMARY KEY IDENTITY(1,1),
                session_id BIGINT NOT NULL,
                member_id BIGINT NOT NULL,
                scanned_at DATETIME NOT NULL DEFAULT GETDATE(),
                is_valid BIT NULL,
                FOREIGN KEY (session_id) REFERENCES training_sessions(session_id),
                FOREIGN KEY (member_id) REFERENCES users(user_id)
            );
        `);

        // 7. progress_records
        console.log('Migrating progress_records...');
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'progress_records')
            CREATE TABLE progress_records (
                record_id BIGINT PRIMARY KEY IDENTITY(1,1),
                member_id BIGINT NOT NULL,
                record_date DATE NOT NULL,
                metric_type NVARCHAR(50) NOT NULL,
                value FLOAT NOT NULL,
                unit NVARCHAR(20) NULL,
                source NVARCHAR(50) NOT NULL,
                created_by BIGINT NOT NULL,
                created_at DATETIME NOT NULL DEFAULT GETDATE(),
                FOREIGN KEY (member_id) REFERENCES users(user_id),
                FOREIGN KEY (created_by) REFERENCES users(user_id)
            );
        `);

        console.log('Sprint 3 Database Migration Completed Successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
}

migrateSprint3();
