// loadHeaderFooter.js
document.addEventListener('DOMContentLoaded', () => {
  const loadComponent = async (selector, url) => {
    const element = document.querySelector(selector);
    if (element) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const html = await response.text();
          element.innerHTML = html;
        } else {
          console.error(`Error loading ${url}:`, response.status);
        }
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
      }
    }
  };

  loadComponent('#header', '/public/html/header.html');
  loadComponent('#footer', '/public/html/footer.html');
});
