/* Wacs Remaster/public/js/login.js */

// Função para mostrar notificações flash
function showFlashNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `flash-notification ${type}`;
    notification.textContent = message;

    // Adicionar ao DOM
    document.body.appendChild(notification);

    // Mostrar notificação
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {

    // Get form elements and message displays
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');

    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');

    const googleLoginBtn = document.getElementById('google-login-btn');

    const toggleLoginPassword = document.getElementById('toggle-login-password');
    const toggleRegisterPassword = document.getElementById('toggle-register-password');
    const toggleRegisterConfirmPassword = document.getElementById('toggle-register-confirm-password');

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    const loginErrorMessage = document.getElementById('error-message');
    const registerErrorMessage = document.getElementById('register-error-message');

    const loadingOverlay = document.querySelector('.loading-overlay');

    // Store referrer in localStorage if not coming from login page itself or register page
    const referrer = document.referrer;
    // Store referrer if it's not the login or register page
    if (referrer && 
        !referrer.includes('/user/login.html') && 
        !referrer.includes('/user/register.html')) {
        localStorage.setItem('redirectAfterLogin', referrer);
    } else {
        // If no valid referrer, check if we came from the community page
        const urlParams = new URLSearchParams(window.location.search);
        const fromCommunity = urlParams.get('from') === 'community';
        if (fromCommunity) {
            localStorage.setItem('redirectAfterLogin', '../comunidade.html');
        }
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
    if (toggleRegisterPassword) {
        toggleRegisterPassword.addEventListener('click', () => {
            togglePasswordVisibility(registerPasswordInput, toggleRegisterPassword);
        });
    }
    if (toggleRegisterConfirmPassword) {
        toggleRegisterConfirmPassword.addEventListener('click', () => {
            togglePasswordVisibility(registerConfirmPasswordInput, toggleRegisterConfirmPassword);
        });
    }

    // Function to show error message (specific to each form)
    function showErrorMessage(element, message) {
        element.textContent = message;
        element.classList.add('show');
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginErrorMessage.textContent = ''; // Clear previous errors
        loadingOverlay.classList.add('show');

        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            showFlashNotification('Login realizado com sucesso!', 'success');
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
            showErrorMessage(loginErrorMessage, message);
        } finally {
            loadingOverlay.classList.remove('show');
        }
    });

    // Handle Google Login
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    googleLoginBtn.addEventListener('click', async () => {
        loadingOverlay.classList.add('show');
        try {
            await firebase.auth().signInWithPopup(googleProvider);
            showFlashNotification('Login com Google realizado com sucesso!', 'success');
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
            showFlashNotification(message, 'error');
        } finally {
            loadingOverlay.classList.remove('show');
        }
    });

    // Handle Register
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            registerErrorMessage.textContent = ''; // Clear previous errors
            loadingOverlay.classList.add('show');

            const email = registerEmailInput.value;
            const password = registerPasswordInput.value;
            const confirmPassword = registerConfirmPasswordInput.value;

            if (password !== confirmPassword) {
                showErrorMessage(registerErrorMessage, 'As senhas não coincidem.');
                loadingOverlay.classList.remove('show');
                return;
            }

            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
                showFlashNotification('Conta criada com sucesso! Você já está logado.', 'success');
                // Optionally, redirect to a dashboard or home page after successful registration
                const redirectTo = localStorage.getItem('redirectAfterLogin') || '../index.html';
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectTo;
            } catch (error) {
                console.error("Firebase Register Error:", error);
                let message = 'Ocorreu um erro ao criar a conta. Por favor, tente novamente.';
                if (error.code === 'auth/email-already-in-use') {
                    message = 'Este email já está em uso.';
                } else if (error.code === 'auth/invalid-email') {
                    message = 'O formato do email é inválido.';
                } else if (error.code === 'auth/weak-password') {
                    message = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
                }
                showErrorMessage(registerErrorMessage, message);
            } finally {
                loadingOverlay.classList.remove('show');
            }
        });
    }

    // Toggle between login and register forms
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

    // Lógica para aplicar o tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    } else {
        // Por padrão, se não houver tema salvo ou for 'dark', remove a classe light-theme
        document.documentElement.classList.remove('light-theme');
    }
}); 