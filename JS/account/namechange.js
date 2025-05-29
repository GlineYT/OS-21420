document.getElementById("submitNewUsername").addEventListener("click", async function () {
    const newUsername = document.getElementById("newUsernameInput").value.trim();
  
    if (!newUsername) {
      alert("Моля, въведете ново потребителско име.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/change-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername })
      });
  
      const result = await response.json();
  
      alert(result.message);
  
      if (response.ok && result.message.includes("променено")) {
        
        window.location.href = "/HTML/login/login.html"; //& Пренасочване към страницата за вход
      }
  
    } catch (err) {
      console.error("Error:", err);
      alert("Възникна грешка при комуникацията със сървъра.");
    }
  });
  