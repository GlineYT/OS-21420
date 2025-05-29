document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (!confirm("Наистина ли искате да изтриете акаунта си? Това действие е необратимо.")) return;

    fetch('http://localhost:3000/deleteaccount', {
        method: 'POST',
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("[УСПЕХ] Акаунтът ви беше успешно изтрит.");
            window.location.href = '/HTML/login/login.html';
        } else {
            alert("[ГРЕШКА] " + data.message);
        }
    })
    .catch(err => {
        console.error("[ГРЕШКА] Неуспех при триене на акаунта:", err);
    });
});