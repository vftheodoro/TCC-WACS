// Identifica as preferências do sistema
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Verifica se há uma preferência salva
const savedTheme = localStorage.getItem('theme');

// Referência ao elemento do botão de alternar tema
const themeToggleBtn = document.getElementById('themeToggle');
const themeToggleMobileBtn = document.getElementById('themeToggleMobile');
const themeIcon = document.querySelector('#themeToggle i');
const themeIconMobile = document.querySelector('#themeToggleMobile i');

// Aplica tema inicial
function applyTheme(theme) {
  if (theme === 'dark' || (theme === null && prefersDarkMode)) {
    document.body.classList.add('dark-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    if (themeIconMobile) themeIconMobile.className = 'fas fa-sun';
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
    if (themeIconMobile) themeIconMobile.className = 'fas fa-moon';
    localStorage.setItem('theme', 'light');
  }
}

// Inicialização
applyTheme(savedTheme);

// Função para alternar o tema
function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || (prefersDarkMode ? 'dark' : 'light');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

// Adiciona event listener ao botão de alternar tema
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}

if (themeToggleMobileBtn) {
  themeToggleMobileBtn.addEventListener('click', toggleTheme);
}

// Listener para mudanças nas preferências do sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const newColorScheme = e.matches ? 'dark' : 'light';
  
  // Só altera automaticamente se o usuário não tiver definido uma preferência
  if (!localStorage.getItem('theme')) {
    applyTheme(newColorScheme);
  }
});

// Adiciona classe quando o JavaScript é carregado
document.documentElement.classList.add('js-loaded'); 