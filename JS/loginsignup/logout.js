
document.getElementById('logoutBtn').addEventListener('click', () => {
  fetch('http://localhost:3000/logout', {
    method: 'GET',
    credentials: 'include' 
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log("[УСПЕХ] Сесията е затворена успешно.");
      window.location.href = '/HTML/mainpage.html'; 
    } else {
      alert("[ГРЕШКА] Неуспешно затваряне на сесията: " + data.message);
    }
  })
  .catch(err => {
    console.error("Logout error:", err);
  });
});
