const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const app = express();
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
const db = require('../db/connection.js'); //! Връзка с базата данни
const profileDataRoute = require('../profiledata.js');
var uname;

app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true 
}));


//!Връзка със базата данни

db.connect((err) => {
    if (err) {
        console.error("[ГРЕШКА] Връзка със базата данни не бе успешна, поради: " + err.stack);
        return;
    }
    console.log("[УСПЕХ] Успешно свързване със база данни!");
});

//? Маршрут за логин
app.use(session({
    secret: 'superSecretSessionKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, 
        httpOnly: true,
        secure: false,               
        sameSite: 'None'             
    }
}));


const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
      db.query(
        `SELECT ID, uname, EMAIL AS email, PHONE AS phone, CREATED_AT AS created, password 
         FROM users WHERE uname = ? OR email = ?`,
        [username, username],
        (err, results) => {
          if (err) return done(err);
          const user = results[0];
          if (!user || user.password !== password) {
            return done(null, false, { message: '[ГРЕШКА] Неправилна парола/потребителско име.' });
          }
          return done(null, user); 
        }
      );
    }
  ));
  
//! Сериализация и десериализация на потребителя
passport.serializeUser((user, done) => done(null, user.ID));
passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE ID = ?", [id], (err, results) => {
    if (err) return done(err);
    if (!results || results.length === 0) {
      return done(null, false);
    }
    return done(null, results[0]);
  });
});

//? Изпращане на отговор на клиента
app.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err) return res.status(500).json({ success: false, message: "[ГРЕШКА] Проблем със сървъра" });
      if (!user) return res.status(401).json({ success: false, message: info.message });
  
      req.logIn(user, function (err) {
        if (err) return res.status(500).json({ success: false, message: "[ГРЕШКА] Грешка във влизането." });

        req.session.username = user.uname;
        req.session.email = user.email;
        req.session.phone = user.phone;
        req.session.created = user.CREATED_AT;
        uname = user.uname; //& Запазване на потребителското име в променлива

        return res.json({ success: true, message: "[УСПЕХ] Успешно влизане." });
      });
    })(req, res, next);
  });
  
  //? Маршрут за проверка на сесията
  app.get("/sessioncheck", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.json({
            loggedIn: true,
            user: req.user
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});


  

//? Маршрут за регистрация
app.post("/register", (req, res) => {
  const { username, password, birthday, email, phone, gender } = req.body;

  if (!username || !password || !email || !birthday) {
      return res.status(400).json({ message: "Попълнете всички задължителни полета!" });
  }

  //& Проверка дали потребителското име вече съществува
  db.query("SELECT uname FROM users WHERE uname = ?", [username], (err, results) => {
      if (err) {
          console.error("[ГРЕШКА] Грешка при търсене на потребител:", err);
          return res.status(500).json({ message: "[ГРЕШКА] Вътрешна грешка при проверка!" });
      }

      if (results.length > 0) {
          //! Потребителското име вече съществува
          return res.status(409).json({ message: "[ГРЕШКА] Това потребителско име вече съществува!" });
      }

      //* Ако името е свободно, извършва се регистрацията
      db.query(
          "INSERT INTO users (uname, password, birthday, email, phone, gender) VALUES (?, ?, ?, ?, ?, ?)",
          [username, password, birthday, email, phone, gender],
          (err, result) => {
              if (err) {
                  console.error("[ГРЕШКА] Грешка при регистрация:", err);
                  return res.status(500).json({ message: "[ГРЕШКА] Неуспешна регистрация!" });
              }

              res.status(201).json({ message: "[УСПЕХ] Успешна регистрация!" });
          }
      );
  });
});

//? Маршрут за извеждане на потребителски данни
app.use('/profiledata', profileDataRoute); 

//? Маршрут за изход
app.get('/logout', (req, res) => {
  req.sessionStore.clear(err => {
      if (err) {
          console.error("[ГРЕШКА] Грешка при изчистване на сесиите:", err);
          return res.status(500).json({ success: false, message: '[ГРЕШКА] Неуспешно изчистване на сесиите' });
      }

      res.clearCookie('connect.sid');
      res.json({ success: true, message: '[УСПЕХ] Всички сесии изчистени. Потребителят е излязъл.' });
      console.log("[УСПЕХ] Изчистени сесии. Потребителят е излязъл.");
  });
});

app.get('/test-session', (req, res) => {
    res.json({ session: req.session });
});
  

//! Маршрут за изтриване на потребител

app.post('/deleteaccount', (req, res) => {
  const username = uname; //& Вземане на потребителското име от сесията

  if (!username) {
      return res.status(401).json({ success: false, message: '[ГРЕШКА] Няма активна сесия за изтриване.' });
  }

  db.query("DELETE FROM users WHERE uname = ?", [username], (err, result) => {
      if (err) {
          console.error("[ГРЕШКА] Грешка при изтриване на акаунт:", err);
          return res.status(500).json({ success: false, message: '[ГРЕШКА] Неуспешно изтриване на акаунта.' });
      }

      req.session.destroy(() => {
          res.clearCookie('connect.sid');
          res.json({ success: true, message: '[УСПЕХ] Акаунтът беше успешно изтрит.' });
      });
  });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[ИНФО] Сървъра слуша на http://127.0.0.1:${PORT}`);
});

