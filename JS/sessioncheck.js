document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileButton");

  if (profileBtn) {
    profileBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        const response = await fetch("http://127.0.0.1:3000/sessioncheck", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (data.loggedIn) {
          window.location.href = "/HTML/profile/main.html";
        } else {
          window.location.href = "/HTML/login/login.html";
        }
      } catch (err) {
        console.error("[ГРЕШКА] Грешка при проверка на сесията:", err);
        window.location.href = "/HTML/login/login.html";
      }
    });
  }
});
 
