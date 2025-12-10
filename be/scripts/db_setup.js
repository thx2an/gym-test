const { sql, connectDB } = require('../config/database');

async function migrate() {
    try {
        console.log("Connecting to Database...");
        await connectDB();

        console.log("Checking and Creating Tables...");

        // 1. Blog Categories
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='blog_categories' AND xtype='U')
            CREATE TABLE blog_categories (
                id INT PRIMARY KEY IDENTITY(1,1),
                name NVARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT GETDATE()
            )
        `);
        console.log("- Table 'blog_categories' checked/created.");

        // 2. Blog Posts
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='blog_posts' AND xtype='U')
            CREATE TABLE blog_posts (
                id INT PRIMARY KEY IDENTITY(1,1),
                title NVARCHAR(255) NOT NULL,
                content NVARCHAR(MAX),
                image_url NVARCHAR(255),
                category_id INT FOREIGN KEY REFERENCES blog_categories(id),
                author_id BIGINT FOREIGN KEY REFERENCES users(user_id),
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        `);
        console.log("- Table 'blog_posts' checked/created.");

        // 3. Ensure Payments has created_at (Common miss)
        // Check if column exists, if not add it. 
        // Note: altering table typically requires caution, but for 'created_at' it's usually safe to add if missing.
        const checkPaymentCol = await new sql.Request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'payments' AND COLUMN_NAME = 'created_at'
        `);
        if (checkPaymentCol.recordset.length === 0) {
            await new sql.Request().query(`ALTER TABLE payments ADD created_at DATETIME DEFAULT GETDATE()`);
            console.log("- Column 'created_at' added to 'payments' table.");
        }

        console.log(" Database Migration Completed Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
}

migrate();
