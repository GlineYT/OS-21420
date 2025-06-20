document.addEventListener("DOMContentLoaded", function() {
    fetch('http://localhost:3000/get-comments-by-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Грешка в мрежата');
        return response.json();
    })
    .then(comments => {
        const container = document.getElementById('comments-container');
        
        // Clear loading message
        container.innerHTML = '';
        
        if (!comments || comments.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="3">Все още нямате публикувани коментари</td>
                </tr>
            `;
            return;
        }
        
        // Add each comment as a new row
        comments.forEach(comment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(comment.article_title || 'Неизвестна статия')}</td>
                <td>${escapeHtml(comment.COMMENT)}</td>
                <td>${new Date(comment.DATE_POSTED).toLocaleDateString('bg-BG')}</td>
            `;
            container.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Грешка при зареждане на коментари:', error);
        document.getElementById('comments-container').innerHTML = `
            <tr>
                <td colspan="3" class="text-danger">Грешка при зареждане на коментарите</td>
            </tr>
        `;
    });

    // Basic HTML escaping function
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});