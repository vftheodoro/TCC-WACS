/* Wacs Remaster/public/js/login.js */

// Get form elements and message displays
const loginForm = document.getElementById('login-form');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');

const googleLoginBtn = document.getElementById('google-login-btn');

const toggleLoginPassword = document.getElementById('toggle-login-password');

// Store referrer in localStorage if not coming from login page itself
// This should be done before any redirection logic to capture the original referring page
const referrer = document.referrer;
// Only store referrer if it's a valid http/https URL and not the login page itself
if (referrer && (referrer.startsWith('http://') || referrer.startsWith('https://')) && !referrer.includes('/login.html')) {
    localStorage.setItem('redirectAfterLogin', referrer);
}

// Function to toggle password visibility
function togglePasswordVisibility(inputElement, toggleElement) {
    const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
    inputElement.setAttribute('type', type);
    
    // Toggle eye icon
    toggleElement.querySelector('i').classList.toggle('fa-eye');
    toggleElement.querySelector('i').classList.toggle('fa-eye-slash');
}

// Event Listeners for password toggles
if (toggleLoginPassword) {
    toggleLoginPassword.addEventListener('click', () => {
        togglePasswordVisibility(loginPasswordInput, toggleLoginPassword);
    });
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showFlashMessage('Login realizado com sucesso!', 'success');
        // Redirect to previous page or a dashboard/home page
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '../index.html';
        localStorage.removeItem('redirectAfterLogin'); // Clean up after use
        window.location.href = redirectTo;
    } catch (error) {
        console.error("Firebase Login Error:", error);
        let message = 'Ocorreu um erro. Por favor, tente novamente.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-login-credentials') {
            message = 'Email ou senha inválidos.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'O formato do email é inválido.';
        } else if (error.code === 'auth/user-disabled') {
            message = 'Esta conta foi desativada.';
        }
        showFlashMessage(message, 'error');
    }
});

// Handle Google Login
const googleProvider = new firebase.auth.GoogleAuthProvider();

googleLoginBtn.addEventListener('click', async () => {
    try {
        await firebase.auth().signInWithPopup(googleProvider);
        showFlashMessage('Login com Google realizado com sucesso!', 'success');
        // Redirect to previous page or a dashboard/home page
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '../index.html';
        localStorage.removeItem('redirectAfterLogin'); // Clean up after use
        window.location.href = redirectTo;
    } catch (error) {
        console.error("Firebase Google Login Error:", error);
        let message = 'Ocorreu um erro ao logar com o Google.';
        if (error.code === 'auth/popup-closed-by-user') {
            message = 'Login com Google cancelado.';
        }
        showFlashMessage(message, 'error');
    }
});

// Lógica para aplicar o tema salvo
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
} else {
    // Por padrão, se não houver tema salvo ou for 'dark', remove a classe light-theme
    document.documentElement.classList.remove('light-theme');
} 