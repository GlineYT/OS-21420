const currentUrl = window.location.href;
//* Remve any GET parameters from the URL
const urlWithoutParams = currentUrl.split('?')[0];
window.history.replaceState({}, document.title, urlWithoutParams); // Update the URL without GET parameters
console.log(window.location.href); // Check what’s *really* being sent


fetch("http://127.0.0.1:3000/get-comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: window.location.href })
  })
  .then(res => res.json())
  .then(data => {
    const commentsContainer = document.getElementById("comments-container");
    commentsContainer.innerHTML = ""; // clear previous if any
  
    data.forEach(comment => {
      const commentBox = document.createElement("div");
      commentBox.classList.add("comment-box");
  
      const username = document.createElement("div");
      username.classList.add("comment-username");
      username.textContent = comment.USERNAME;
  
      const text = document.createElement("div");
      text.classList.add("comment-text");
      text.textContent = comment.COMMENT;
  
      commentBox.appendChild(username);
      commentBox.appendChild(text);
      commentsContainer.appendChild(commentBox);
    });
  })
  .catch(err => console.error("Error loading comments:", err));
  