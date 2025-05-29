document.addEventListener("DOMContentLoaded", () => {
    fetch("http://127.0.0.1:3000/getusers")
      .then(response => response.json())
      .then(users => {
        const tableBody = document.getElementById("users-table");
        tableBody.innerHTML = ""; // Clear existing content if any
  
        users.forEach(user => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${user.ID}</td>
            <td>${user.uname}</td>
            <td>${user.EMAIL}</td>
            <td>${user.PHONE}</td>
            <td>${user.password}</td>
            <td>${user.GENDER}</td>
            <td>${new Date(user.CREATED_AT).toLocaleString()}</td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(error => {
        console.error("Error fetching users:", error);
      });
  });
  