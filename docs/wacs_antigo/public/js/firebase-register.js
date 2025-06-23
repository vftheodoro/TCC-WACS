// Configuração do Firebase
const firebaseConfig = {
    apiKey: window.ENV.FIREBASE_API_KEY,
    authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
    projectId: window.ENV.FIREBASE_PROJECT_ID,
    storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
    appId: window.ENV.FIREBASE_APP_ID,
    measurementId: window.ENV.FIREBASE_MEASUREMENT_ID
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Inicializar Firestore

// Elementos da página
const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
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

// Função para salvar dados do usuário no Firestore
function saveUserToFirestore(user, additionalData = {}) {
    // Dados básicos do usuário
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.name || '',
        photoURL: user.photoURL || null,
        phoneNumber: user.phoneNumber || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        ADM: 0, // Valor padrão para novos usuários
        // Compatibilidade total com o app:
        name: additionalData.name || user.displayName || '',
        phone: additionalData.phone || user.phoneNumber || '',
        cidade: additionalData.cidade || '',
        birthdate: additionalData.birthdate || '',
        mobilityType: additionalData.mobilityType || '',
        comorbidades: additionalData.comorbidades || [],
        acceptTerms: additionalData.acceptTerms !== undefined ? additionalData.acceptTerms : true,
        username: additionalData.username || '',
        registrationMethod: additionalData.registrationMethod || 'email',
        accountStatus: additionalData.accountStatus || 'active',
        userRole: additionalData.userRole || 'user',
        // Outros campos extras podem ser adicionados aqui
        ...additionalData
    };

    // Salvar ou atualizar os dados do usuário no Firestore
    return db.collection('users').doc(user.uid).set(userData, { merge: true })
        .then(() => {
            console.log('Dados do usuário salvos com sucesso no Firestore');
            return userData;
        })
        .catch((error) => {
            console.error('Erro ao salvar dados do usuário no Firestore:', error);
            throw error;
        });
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
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const username = document.getElementById('username').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const mobilityType = document.getElementById('mobilityType').value;
    // Coletar múltiplas comorbidades
    const comorbidadesSelect = document.getElementById('comorbidades');
    const comorbidades = Array.from(comorbidadesSelect.selectedOptions).map(opt => opt.value);
    const phoneNumber = phoneInput.value.trim();
    
    // Validação básica
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Por favor, preencha todos os campos obrigatórios.');
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
                // Salvar dados adicionais no Firestore, compatível com o app
                return saveUserToFirestore(user, {
                    name: name,
                    phone: phone,
                    cidade: cidade,
                    birthdate: birthdate,
                    mobilityType: mobilityType,
                    comorbidades: comorbidades,
                    acceptTerms: true,
                    photoURL: null,
                    username: username,
                    registrationMethod: 'email',
                    accountStatus: 'active',
                    userRole: 'user',
                    phoneNumber: phoneNumber
                });
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
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            // Salvar dados do usuário no Firestore
            return saveUserToFirestore(user, {
                registrationMethod: 'google',
                accountStatus: 'active',
                userRole: 'user',
                isNewUser: isNewUser,
                phoneNumber: phoneInput.value.trim() // Adicionar telefone se disponível
            }).then(() => {
                showAlert('Conta com Google criada/vinculada com sucesso!', 'success');
                setTimeout(redirectAfterRegister, 1500);
            });
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
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            // Salvar dados do usuário no Firestore
            return saveUserToFirestore(user, {
                registrationMethod: 'facebook',
                accountStatus: 'active',
                userRole: 'user',
                isNewUser: isNewUser,
                phoneNumber: phoneInput.value.trim() // Adicionar telefone se disponível
            }).then(() => {
                showAlert('Conta com Facebook criada/vinculada com sucesso!', 'success');
                setTimeout(redirectAfterRegister, 1500);
            });
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
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            // Salvar dados do usuário no Firestore
            return saveUserToFirestore(user, {
                registrationMethod: 'github',
                accountStatus: 'active',
                userRole: 'user',
                isNewUser: isNewUser,
                phoneNumber: phoneInput.value.trim() // Adicionar telefone se disponível
            }).then(() => {
                showAlert('Conta com GitHub criada/vinculada com sucesso!', 'success');
                setTimeout(redirectAfterRegister, 1500);
            });
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
        
        // Atualizar a data do último login
        if (user.uid) {
            db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(error => {
                console.error('Erro ao atualizar último login:', error);
            });
        }
        
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