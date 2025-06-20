document.addEventListener('DOMContentLoaded', function() {
    fetchArticles();
  });
  
  async function fetchArticles() {
    try {
      const response = await fetch('http://localhost:3000/list-articles');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const articles = await response.json();
      populateArticlesTable(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      document.getElementById('articles-table').innerHTML = `
        <tr>
          <td colspan="4" class="text-danger">Грешка при зареждане на статиите</td>
        </tr>
      `;
    }
  }
  
  function populateArticlesTable(articles) {
    const tableBody = document.getElementById('articles-table');
    tableBody.innerHTML = ''; // Clear existing rows
  
    articles.forEach(article => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${article.article_id}</td>
        <td>${escapeHtml(article.title)}</td>
        <td><a href="${escapeHtml(article.link)}" target="_blank">Линк</a></td>
        <td>${new Date(article.created_at).toLocaleDateString('bg-BG')}</td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }