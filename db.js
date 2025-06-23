const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

if (process.env.NODE_ENV == 'production') {
  dbConfig.ssl = {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA,
  };
}

const db = mysql.createConnection(dbConfig);

db.connect = (err) => {
  if (err) {
    console.error('Database connection error:', err);
    throw err;
  }
  console.log('Connected to MySQL database');
};

module.exports = db;
