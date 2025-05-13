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
const db = firebase.firestore();

// Elementos da página
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const forgotPasswordLink = document.getElementById('forgotPassword');
const googleLoginBtn = document.getElementById('googleLogin');
const facebookLoginBtn = document.getElementById('facebookLogin');
const githubLoginBtn = document.getElementById('githubLogin');
const registerLink = document.getElementById('registerLink');
const alertDiv = document.getElementById('alert');

// Configuração de persistência
auth.setPersistence(
    rememberCheckbox.checked 
    ? firebase.auth.Auth.Persistence.LOCAL 
    : firebase.auth.Auth.Persistence.SESSION
);

// Função para atualizar dados do usuário no Firestore
function updateUserData(user) {
    if (!user) return Promise.reject('Nenhum usuário fornecido');
    
    // Dados básicos a serem atualizados no login
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Verificar se o documento do usuário já existe
    return db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                // Apenas atualizar o último login
                return db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Criar um novo documento para o usuário
                return db.collection('users').doc(user.uid).set({
                    ...userData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    accountStatus: 'active',
                    userRole: 'user'
                });
            }
        })
        .then(() => {
            console.log('Dados do usuário atualizados com sucesso no Firestore');
            return userData;
        })
        .catch((error) => {
            console.error('Erro ao atualizar dados do usuário no Firestore:', error);
            // Não vamos interromper o fluxo de login se falhar a atualização de dados
            return userData;
        });
}

// Função para mostrar alerta
function showAlert(message, type = 'error') {
    alertDiv.textContent = message;
    alertDiv.className = `alert ${type}`;
    
    // Esconder o alerta após 5 segundos
    setTimeout(() => {
        alertDiv.className = 'alert hidden';
    }, 5000);
}

// Função para redirecionar após login
function redirectAfterLogin() {
    // Redireciona para a página do dashboard (ou para onde quiser)
    window.location.href = '../dashboard.html';
}

// Evento de submit do formulário
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validação básica
    if (!email || !password) {
        showAlert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Fazer login com Email/Senha
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login bem-sucedido
            const user = userCredential.user;
            
            // Atualizar dados do usuário no Firestore
            return updateUserData(user).then(() => {
                showAlert('Login realizado com sucesso!', 'success');
                setTimeout(redirectAfterLogin, 1500);
            });
        })
        .catch((error) => {
            // Tratar erros específicos
            let errorMessage;
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Usuário não encontrado.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Senha incorreta.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Formato de email inválido.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
                    break;
                default:
                    errorMessage = `Erro: ${error.message}`;
            }
            
            showAlert(errorMessage);
            console.error(error);
        });
});

// Login com Google
googleLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            // Atualizar dados do usuário no Firestore
            return updateUserData(user).then(() => {
                showAlert('Login com Google realizado com sucesso!', 'success');
                setTimeout(redirectAfterLogin, 1500);
            });
        })
        .catch((error) => {
            showAlert(`Erro ao fazer login com Google: ${error.message}`);
            console.error(error);
        });
});

// Login com Facebook
facebookLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            // Atualizar dados do usuário no Firestore
            return updateUserData(user).then(() => {
                showAlert('Login com Facebook realizado com sucesso!', 'success');
                setTimeout(redirectAfterLogin, 1500);
            });
        })
        .catch((error) => {
            showAlert(`Erro ao fazer login com Facebook: ${error.message}`);
            console.error(error);
        });
});

// Login com GitHub
githubLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            // Atualizar dados do usuário no Firestore
            return updateUserData(user).then(() => {
                showAlert('Login com GitHub realizado com sucesso!', 'success');
                setTimeout(redirectAfterLogin, 1500);
            });
        })
        .catch((error) => {
            showAlert(`Erro ao fazer login com GitHub: ${error.message}`);
            console.error(error);
        });
});

// Recuperação de senha
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showAlert('Por favor, digite seu email para redefinir a senha.');
        emailInput.focus();
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showAlert('Email de redefinição de senha enviado. Verifique sua caixa de entrada.', 'success');
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Formato de email inválido.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Nenhum usuário encontrado com este email.';
                    break;
                default:
                    errorMessage = `Erro: ${error.message}`;
            }
            
            showAlert(errorMessage);
            console.error(error);
        });
});

// Redirecionar para página de registro
registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'register.html';
});

// Verificar se o usuário já está logado
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuário já está logado
        console.log('Usuário já logado:', user.email);
        
        // Atualizar último login se estiver em outra página que não seja login/register
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
            updateUserData(user).catch(error => {
                console.error('Erro ao atualizar último login:', error);
            });
        }
        
        // Verificar se estamos na página de login (para não redirecionar se estivermos em outra página)
        if (window.location.pathname.includes('login.html')) {
            redirectAfterLogin();
        }
    } else {
        // Usuário não está logado
        console.log('Nenhum usuário logado');
    }
});

// Atualizar a persistência quando o checkbox for alterado
rememberCheckbox.addEventListener('change', () => {
    auth.setPersistence(
        rememberCheckbox.checked 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION
    );
}); 