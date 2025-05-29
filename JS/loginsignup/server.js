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
var uid;

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
//? Промяна на потребителско име
app.post("/change-username", (req, res) => {
  const { newUsername } = req.body;
  const currentUsername = uname; //& Вземане на текущото потребителско име от сесията

  if (!newUsername) {
    return res.status(400).json({ message: "Моля, въведете ново потребителско име." });
  }

  db.query("SELECT * FROM users WHERE uname = ?", [newUsername], (err, results) => {
    if (err) {
      console.error("[ГРЕШКА] При търсене на потребител:", err);
      return res.status(500).json({ message: "Грешка при търсенето." });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Потребителското име вече съществува." });
    }

    db.query("UPDATE users SET uname = ? WHERE uname = ?", [newUsername, currentUsername], (err2, result2) => {
      if (err2) {
        console.error("[ГРЕШКА] При актуализиране на потребителското име:", err2);
        return res.status(500).json({ message: "Грешка при промяна на потребителското име." });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Грешка при изтриване на сесията:", err);
        }
      });
      res.status(200).json({ message: "Потребителското име е променено. Моля, влезте отново." });
      });
    });
  });

//! Маршрут за смяна на парола
app.post("/change-password", (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Моля, попълнете и двете полета." });
  }

  const currentUsername = uname; 

  db.query("SELECT password FROM users WHERE uname = ?", [currentUsername], (err, results) => {
    if (err) {
      console.error("Грешка при четене от базата:", err);
      return res.status(500).json({ message: "[ГРЕШКА] Грешка в сървъра." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "[ГРЕШКА] Потребителят не е намерен." });
    }

    const actualPassword = results[0].password;

    if (oldPassword !== actualPassword) {
      return res.status(403).json({ message: "[ГРЕШКА] Старата парола е грешна." });
    }

    db.query("UPDATE users SET password  = ? WHERE uname = ?", [newPassword, currentUsername], (err2) => {
      if (err2) {
        console.error("Грешка при промяна на паролата:", err2);
        return res.status(500).json({ message: "[ГРЕШКА] Неуспешна смяна на паролата." });
      }

      req.session.destroy((err3) => {
        if (err3) console.error("Session destroy error:", err3);
        res.status(200).json({ message: "[УСПЕХ] Паролата е променена успешно. Моля, влезте отново." });
      });
    });
  });
});

app.post("/get-comments", (req, res) => {
  const articleUrl = req.body.url;

  if (!articleUrl) {
    return res.status(400).json({ message: "Невалиден URL" });
  }

  const getArticleIdQuery = "SELECT article_id FROM NEWS WHERE link = ?"; // <-- this line was missing
  db.query(getArticleIdQuery, [articleUrl], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json([]);
    }

    const articleId = result[0].article_id;

    const getCommentsQuery = "SELECT USERNAME, COMMENT FROM COMMENTS WHERE article_id = ? ORDER BY DATE_POSTED DESC";
    db.query(getCommentsQuery, [articleId], (err2, comments) => {
      if (err2) {
        console.error("Грешка при заявка за коментари:", err2);
        return res.status(500).json([]);
      }

      res.status(200).json(comments);
    });
  });
});

//? Маршрут за извеждане на коментари за администратор

app.get("/get-all-comments", (req, res) => {
  const query = `
    SELECT 
      c.COMMENT_ID,
      c.USERNAME,
      c.COMMENT,
      c.DATE_POSTED,
      n.link AS article_link,
      n.title AS article_title
    FROM COMMENTS c
    JOIN NEWS n ON c.ARTICLE_ID = n.article_id
    ORDER BY c.DATE_POSTED DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("[ГРЕШКА] Грешка при извеждането на коментари:", err);
      return res.status(500).json({ error: "[ГРЕШКА] Грешка с базата данни" });
    }
    res.json(results);
  });
});
//! Маршрут за изтриване на коментар
app.delete("/delete-comment/:id", (req, res) => {
  const commentId = req.params.id;
  const query = "DELETE FROM COMMENTS WHERE COMMENT_ID = ?";
  
  db.query(query, [commentId], (err, result) => {
    if (err) {
      console.error("Error deleting comment:", err);
      res.status(500).send("Грешка при изтриване.");
    } else {
      res.sendStatus(200);
    }
  });
});

//? Маршрут за извеждане на потребители за администратор
app.get("/getusers", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});





const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[ИНФО] Сървъра слуша на http://127.0.0.1:${PORT}`);
});

