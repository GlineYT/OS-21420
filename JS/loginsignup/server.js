const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const app = express();
app.use(express.json());

//* Включи CORS

const whitelist = [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://localhost:3000"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));


app.use(session({
    secret: 'superSecretSessionKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 10000,
        httpOnly: true,
        secure: false, 
        sameSite: 'Lax' 
    }
}));

//!Връзка със базата данни
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "DRAGSTER",
});

db.connect((err) => {
    if (err) {
        console.error("[ГРЕШКА] Връзка със базата данни не бе успешна, поради: " + err.stack);
        return;
    }
    console.log("[УСПЕХ] Успешно свързване със база данни!");
});

//? Маршрут за логин
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Попълнете всички полета!" });
    }
    //* SQL заявка за проверка на потребител
    // ! Използваме параметризирани заявки, за да избегнем SQL инжекции
    db.query("SELECT * FROM users WHERE uname = ? OR email = ?", [username, username], (err, results) => {
        if (err) {
            console.error("[ГРЕШКА] Грешка при проверка на потребител:", err);
            return res.status(500).json({ success: false, message: "[ГРЕШКА] Грешка при вход!" });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "[ГРЕШКА] Грешно потребителско име или парола!" });
        }

        const user = results[0];
        // ! Проверка на паролата
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "[ГРЕШКА] Грешна парола!" });
        }

        // ! Запазваме потребителската сесия
        req.session.user = {
            id: user.ID,           // ✅ uppercase column name
            uname: user.uname,     // ✅ assuming lowercase is correct here
            email: user.EMAIL      // ✅ uppercase column name
        };
        
        console.log("[УСПЕХ] Успешен вход за потребител:", user.uname); 
        console.log("[УСПЕХ] Със следната сесия:", req.session.user);

        
        res.json({ success: true, message: "[УСПЕХ] Успешен вход!" });
    });
});



//? Маршрут за регистрация
app.post("/register", (req, res) => {
    const { username, password, birthday, email, phone, gender } = req.body;

    console.log(express.json()); //! Показва, че е включен парсърът на JSON
    
    if (!username || !password || !email || !birthday) { //! Проверка за празни полета
        return res.status(400).json({ message: "Попълнете всички задължителни полета!" });
    }

    //* SQL заявка за вкарване на нов потребител
    db.query(
        "INSERT INTO users (uname, password, birthday, email, phone, gender) VALUES (?, ?, ?, ?, ?, ?)", //& SQL заявка
        [username, password, birthday, email, phone, gender],
        (err, result) => {
            if (err) {
                console.error("[ГРЕШКА] Грешка при регистрация:", err); //! Показва грешката в конзолата
                return res.status(500).json({ message: "[ГРЕШКА] Грешка при регистрация!" }); //! Връща грешка при регистрация
            }
            res.status(201).json({ message: "[УСПЕХ]  Успешна регистрация!" }); //! Връща успешна регистрация
        }
    );
});
//? Маршрут за проверка на сесията
app.get("/sessioncheck", (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user // !Send session user data if logged in
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});


  

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[ИНФО] Сървъра слуша на http://localhost:${PORT}`);
});

