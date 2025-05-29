
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "DRAGSTER",
      charset: "utf8mb4"
});

module.exports = db;
