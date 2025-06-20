document.addEventListener("DOMContentLoaded", () => {
  const commentsTableBody = document.querySelector("#comments-table tbody");

  fetch("http://127.0.0.1:3000/get-all-comments")
    .then(res => res.json())
    .then(comments => {
      commentsTableBody.innerHTML = ""; // Clear existing rows

      comments.forEach(comment => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${comment.COMMENT_ID}</td>
          <td>${comment.USERNAME}</td>
          <td>${comment.COMMENT.replace(/\n/g, "<br>")}</td>
          <td>${new Date(comment.DATE_POSTED).toLocaleString()}</td>
          <td><a href="${comment.article_link}" target="_blank" rel="noopener noreferrer">${comment.article_title}</a></td>
          <td>
            <button class="btn delete-btn btn-custom" data-id="${comment.COMMENT_ID}">
              Изтрий
            </button>
          </td>
        `;

        tr.querySelector(".delete-btn").addEventListener("click", (e) => {
          const commentId = e.target.dataset.id;

          if (confirm("Сигурни ли сте, че искате да изтриете този коментар?")) {
            fetch(`http://127.0.0.1:3000/delete-comment/${commentId}`, {
              method: "DELETE",
              headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token') // Optional auth
              }
            })
              .then(res => {
                if (res.ok) {
                  tr.remove(); // Remove the row from the table
                } else {
                  alert("Неуспешно изтриване на коментар.");
                  if (res.status === 403) {
                    alert("Нямате права да изтривате коментари.");
                  }
                }
              });
          }
        });

        commentsTableBody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Failed to load comments:", err);
      commentsTableBody.innerHTML = `<tr><td colspan="6">Грешка при зареждане на коментари.</td></tr>`;
    });
});
