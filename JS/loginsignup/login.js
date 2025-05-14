document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login").addEventListener("click", function (event) {
        event.preventDefault();
        //? Взимане на стойностите от полетата
        const username = document.getElementById("firstName").value;
        const password = document.getElementById("password").value;
        //? Проверка за празни полета
        if (!username || !password) {
            alert("Моля, попълнете всички полета!");
            return;
        }
        //? Изпращане на заявка към сървъра
        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                //? Задаване на заглавие за изпращане на JSON
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        })
        //^ Обработка на отговора
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = "/HTML/profile/main.html"; //! Пренасочване към начална страница след вход
            } else {
                //? Показване на съобщение за грешка
                alert("Грешно потребителско име или парола!");
            }
        })
        //! Обработка на грешка
        .catch(error => {
            console.error("[ГРЕШКА] Грешка при вход:", error);
            alert("[ГРЕШКА] Възникна грешка. Опитайте отново! Иформация за грешката: ", error);
        });
    });
});
