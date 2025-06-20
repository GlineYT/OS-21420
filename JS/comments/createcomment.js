document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.getElementById('commentForm');
    console.log("[ИНФО] Изпращане на следния адрес: ", window.location.pathname);
    
    if (!commentForm) {
      console.error('Error: Could not find comment form with ID "commentForm"');
      return;
    }
  
    commentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const commentInput = document.getElementById('comment');
      const commentText = commentInput.value.trim();
      
      if (!commentText) {
        alert("Моля, въведете текст в коментара преди изпращане!");
        return;
      }
  
      try {
        console.log("Attempting to submit comment:", commentText);
        
        const response = await fetch('http://localhost:3000/create-comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment: commentText,
            articleLink: 'http://127.0.0.1:5500' + window.location.pathname
          })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log("Server response:", result);
        
        if (result.success) {
          alert(result.message);
          commentInput.value = '';
          // Optional: Refresh comments without page reload
          if (typeof loadComments === 'function') {
            loadComments();
          }
        } else {
          alert(`Грешка: ${result.message || "Неуспешно изпращане"}`);
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert("Възникна грешка при изпращане. Моля, опитайте по-късно.");
      }
    });
  });