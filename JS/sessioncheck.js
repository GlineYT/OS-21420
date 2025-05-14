document.addEventListener("DOMContentLoaded", () => {
    const profileIcon = document.querySelector("img[src='/IMG/icon/person-fill-add.svg']");
  
    if (profileIcon) {
      profileIcon.addEventListener("click", async (event) => {
        event.preventDefault();
  
        try {
          const response = await fetch("http://localhost:3000/sessioncheck", {
            method: "GET",
            credentials: "include", //? Включва бисквитките в заявката
          });
  
          const data = await response.json();
  
          if (data.loggedIn) {
            window.location.href = "/HTML/profile.html"; //* Отваря страницата на профила
          } else {
            window.location.href = "/HTML/login/login.html"; // ^ Отваря страницата за вход
          }
        } catch (err) {
          console.error("[ГРЕШКА] Грешка при проверка на сесията:", err);
          window.location.href = "/HTML/login/login.html"; //! Ако има грешка, пренасочва към логин
        }
      });
    }
  });
  