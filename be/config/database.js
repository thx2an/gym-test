const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, // Use true for Azure, false for local dev (mostly)
        trustServerCertificate: true // Self-signed certs
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
