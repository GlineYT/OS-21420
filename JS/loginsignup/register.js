document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("firstName").value;
        const password = document.getElementById("password").value;
        const birthday = document.getElementById("birthdayDate").value;
        const email = document.getElementById("emailAddress").value;
        const phone = document.getElementById("phoneNumber").value;
        const gender = document.getElementById("femaleGender").checked ? "Жена" : "Мъж";

        const userData = {
            username,
            password,
            birthday,
            email,
            phone,
            gender
        };

        try {
            const response = await fetch("http://127.0.0.1:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.status === 201) {
                console.log("[УСПЕХ] Регистрацията беше успешна!");
                window.location.href = "/HTML/login/login.html";
            } else if (response.status === 409) {
                alert(result.message); 
            } else if (response.status === 400) {
                alert("Моля, попълнете всички задължителни полета.");
            } else {
                console.error("[ГРЕШКА] " + result.message);
                alert("[ГРЕШКА] " + result.message);
            }
        } catch (error) {
            console.error("[ГРЕШКА] Грешка при регистрацията:", error);
            alert("[ГРЕШКА] Възникна проблем със сървъра.");
        }
    });
});
