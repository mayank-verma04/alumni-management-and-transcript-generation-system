document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  // Simulate loading process
  setTimeout(() => {
    loader.classList.add('hidden'); // Hide the loader
  }, 1500);
});
