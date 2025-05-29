document.getElementById("submitNewPassword").addEventListener("click", async function () {
    const oldPassword = document.getElementById("oldPasswordInput").value.trim();
    const newPassword = document.getElementById("newPasswordInput").value.trim();
  
    if (!oldPassword || !newPassword) {
      alert("Моля, попълнете и двете полета.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });
  
      const result = await response.json();
      alert(result.message);
  
      if (response.ok && result.message.includes("успешно")) {
        window.location.href = "/HTML/login/login.html";
      }
  
    } catch (err) {
      console.error("Error:", err);
      alert("Възникна грешка при комуникацията със сървъра.");
    }
  });
  