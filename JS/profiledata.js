const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database:"DRAGSTER",
  charset: "utf8mb4"
});



router.get('/', (req, res) => {
    if (!req.session || !req.session.username) {
        return res.status(401).json({ success: false, message: "Not authenticated." });
    }

    const uname = req.session.username;
    const sql = 'SELECT uname, EMAIL, PHONE, CREATED_AT FROM users WHERE uname = ?';

    db.query(sql, [uname], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: '[ГРЕШКА] Грешка при зареждането на базата данни' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: '[ГРЕШКА] Потребителя не бе намерен.' });
        }

        const user = results[0];
        res.json({
            success: true,
            user: {
                uname: user.uname,
                email: user.EMAIL,
                phone: user.PHONE,
                created: user.CREATED_AT
            }
        });
    });
});

module.exports = router;
