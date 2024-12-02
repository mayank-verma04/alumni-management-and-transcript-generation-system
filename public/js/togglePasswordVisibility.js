// Toggle Password Visibility
document.addEventListener('DOMContentLoaded', () => {
  const toggleVisibility = (iconShow, iconHide, passwordInput) => {
    iconShow.addEventListener('click', () => {
      passwordInput.type = 'text';
      iconShow.classList.add('hidden');
      iconHide.classList.remove('hidden');
    });

    iconHide.addEventListener('click', () => {
      passwordInput.type = 'password';
      iconHide.classList.add('hidden');
      iconShow.classList.remove('hidden');
    });
  };

  const passwordField = document.getElementById('password');
  const visibility = document.getElementById('visibility');
  const visibilityOff = document.getElementById('visibility_off');

  toggleVisibility(visibility, visibilityOff, passwordField);
});
