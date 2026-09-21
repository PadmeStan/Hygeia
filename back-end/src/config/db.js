const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
<<<<<<< HEAD
  password: process.env.DB_PASSWORD || 'admin',
=======
  password: process.env.DB_PASSWORD || 'arievilo',
>>>>>>> 20889172977457acf83edbfd2aee4ce1c0145219
  database: process.env.DB_NAME || 'hygeia_db',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
