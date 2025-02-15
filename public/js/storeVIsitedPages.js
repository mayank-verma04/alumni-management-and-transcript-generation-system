document.addEventListener('DOMContentLoaded', function () {
  let visitedPages = JSON.parse(sessionStorage.getItem('visitedPages')) || [];

  // Avoid duplicate entries for the same page
  if (
    visitedPages.length === 0 ||
    visitedPages[visitedPages.length - 1] !== window.location.href
  ) {
    visitedPages.push(window.location.href);
    sessionStorage.setItem('visitedPages', JSON.stringify(visitedPages));
  }
});
