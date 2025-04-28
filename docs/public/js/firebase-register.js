// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBwzZWs5rFSPz2Ua7BwT9H9LSViLqCTm_g",
    authDomain: "wacs-project-97f52.firebaseapp.com",
    projectId: "wacs-project-97f52",
    storageBucket: "wacs-project-97f52.firebasestorage.app",
    messagingSenderId: "94601587488",
    appId: "1:94601587488:web:25f81176e4091126024545",
    measurementId: "G-RCGN9LG5F1"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Elementos da página
const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsCheckbox = document.getElementById('terms');
const passwordMeter = document.getElementById('passwordMeter');
const passwordStrengthText = document.getElementById('passwordStrengthText');
const googleRegisterBtn = document.getElementById('googleRegister');
const facebookRegisterBtn = document.getElementById('facebookRegister');
const githubRegisterBtn = document.getElementById('githubRegister');
const alertDiv = document.getElementById('alert');

// Função para mostrar alerta
function showAlert(message, type = 'error') {
    alertDiv.textContent = message;
    alertDiv.className = `alert ${type}`;
    
    // Esconder o alerta após 5 segundos
    setTimeout(() => {
        alertDiv.className = 'alert hidden';
    }, 5000);
}

// Função para redirecionar após registro
function redirectAfterRegister() {
    // Redireciona para a página após o registro (dashboard ou qualquer outra página)
    window.location.href = '../dashboard.html';
}

// Função para verificar a força da senha
function checkPasswordStrength(password) {
    // Remove as classes atuais
    passwordMeter.className = 'password-strength-meter';
    
    // Retorna se a senha estiver vazia
    if (!password) {
        passwordStrengthText.textContent = 'A senha deve ter pelo menos 8 caracteres';
        return;
    }
    
    // Critérios de força
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;
    
    // Cálculo da pontuação (0-4)
    let score = 0;
    if (length >= 8) score++;
    if (hasLowerCase && hasUpperCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;
    
    // Exibição da força
    if (length < 8) {
        passwordMeter.className = 'password-strength-meter weak';
        passwordStrengthText.textContent = 'Senha muito fraca';
    } else if (score === 1) {
        passwordMeter.className = 'password-strength-meter weak';
        passwordStrengthText.textContent = 'Senha fraca';
    } else if (score === 2) {
        passwordMeter.className = 'password-strength-meter medium';
        passwordStrengthText.textContent = 'Senha média';
    } else if (score === 3) {
        passwordMeter.className = 'password-strength-meter strong';
        passwordStrengthText.textContent = 'Senha forte';
    } else if (score === 4) {
        passwordMeter.className = 'password-strength-meter very-strong';
        passwordStrengthText.textContent = 'Senha muito forte';
    }
}

// Evento para monitorar a senha em tempo real
passwordInput.addEventListener('input', () => {
    checkPasswordStrength(passwordInput.value);
});

// Evento de submit do formulário
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Obter valores dos campos
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validação básica
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Por favor, preencha todos os campos.');
        return;
    }
    
    if (password.length < 8) {
        showAlert('A senha deve ter pelo menos 8 caracteres.');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('As senhas não coincidem.');
        return;
    }
    
    if (!termsCheckbox.checked) {
        showAlert('Você deve concordar com os Termos de Serviço e Política de Privacidade.');
        return;
    }
    
    // Criar conta no Firebase
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Conta criada com sucesso
            const user = userCredential.user;
            
            // Atualizar o perfil com o nome do usuário
            return user.updateProfile({
                displayName: name
            }).then(() => {
                showAlert('Conta criada com sucesso!', 'success');
                setTimeout(redirectAfterRegister, 1500);
            });
        })
        .catch((error) => {
            // Tratar erros específicos
            let errorMessage;
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Formato de email inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'A senha é muito fraca.';
                    break;
                default:
                    errorMessage = `Erro: ${error.message}`;
            }
            
            showAlert(errorMessage);
            console.error(error);
        });
});

// Registrar com Google
googleRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!termsCheckbox.checked) {
        showAlert('Você deve concordar com os Termos de Serviço e Política de Privacidade.');
        return;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            showAlert('Conta com Google criada/vinculada com sucesso!', 'success');
            setTimeout(redirectAfterRegister, 1500);
        })
        .catch((error) => {
            showAlert(`Erro ao registrar com Google: ${error.message}`);
            console.error(error);
        });
});

// Registrar com Facebook
facebookRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!termsCheckbox.checked) {
        showAlert('Você deve concordar com os Termos de Serviço e Política de Privacidade.');
        return;
    }
    
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            showAlert('Conta com Facebook criada/vinculada com sucesso!', 'success');
            setTimeout(redirectAfterRegister, 1500);
        })
        .catch((error) => {
            showAlert(`Erro ao registrar com Facebook: ${error.message}`);
            console.error(error);
        });
});

// Registrar com GitHub
githubRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!termsCheckbox.checked) {
        showAlert('Você deve concordar com os Termos de Serviço e Política de Privacidade.');
        return;
    }
    
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            showAlert('Conta com GitHub criada/vinculada com sucesso!', 'success');
            setTimeout(redirectAfterRegister, 1500);
        })
        .catch((error) => {
            showAlert(`Erro ao registrar com GitHub: ${error.message}`);
            console.error(error);
        });
});

// Verificar se o usuário já está logado
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuário já está logado
        console.log('Usuário já logado:', user.email);
        
        // Se estamos na página de registro, redireciona
        if (window.location.pathname.includes('register.html')) {
            // Opcional: mostrar mensagem de que já está logado antes de redirecionar
            showAlert('Você já está logado. Redirecionando...', 'success');
            setTimeout(redirectAfterRegister, 1500);
        }
    } else {
        // Usuário não está logado
        console.log('Nenhum usuário logado');
    }
}); 