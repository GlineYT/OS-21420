document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("firstName").value;
        const password = document.getElementById("password").value;
        const birthday = document.getElementById("birthdayDate").value;
        const email = document.getElementById("emailAddress").value;
        const phone = document.getElementById("phoneNumber").value;
        const gender = document.getElementById("femaleGender").checked ? "Жена" : "Мъж";

        const userData = { //! Обект с данни за потребителя
            username,
            password,
            birthday,
            email,
            phone,
            gender
        };

        try {
            const response = await fetch("http://localhost:3000/register", { // !await
                method: "POST", //? POST метод
                 headers: {
                    "Content-Type": "application/json" //? Подава данни в JSON формат, като дефинира заглавка
                },
                body: JSON.stringify(userData) 
            });

            console.log("[ИНФО] Заявката е:", userData);

            const result = await response.json(); //!  await

            if (response.ok) {
                console.log("[УСПЕХ] Регистрацията беше успешна!");
                window.location.href = "/HTML/login/login.html";
            } else {
                console.error("[ГРЕШКА] " + result.message);
            }
        } catch (error) {
            console.error("[ГРЕШКА] Грешка при регистрацията: ", error);
            console.error("[ГРЕШКА] Възникна проблем със сървъра.");
        }
    });
});
