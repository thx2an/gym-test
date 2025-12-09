const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD, // Make sure to set this in .env
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'GymManagement',
    options: {
        encrypt: false, // Use true for Azure
        trustServerCertificate: true // Change to false for production
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('✅ SQL Server Connected Successfully');
    } catch (err) {
        console.error('❌ Database Connection Failed:', err);
        process.exit(1);
    }
};

module.exports = { connectDB, sql };
