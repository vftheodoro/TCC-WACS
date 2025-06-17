// public/js/auth-check.js

// Initialize Firebase (if not already initialized by env-config.js or login.js)
// Ensure this block runs only once if Firebase is initialized elsewhere
if (!firebase.apps.length) {
    const firebaseConfig = {
        apiKey: window.ENV.FIREBASE_API_KEY,
        authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
        projectId: window.ENV.FIREBASE_PROJECT_ID,
        storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
        appId: window.ENV.FIREBASE_APP_ID,
        measurementId: window.ENV.FIREBASE_MEASUREMENT_ID
    };
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// --- Utility Functions (moved or adapted from script.js and login.js) ---

// Global flash message utility (ensure it's only created once)
let flashNotification = document.querySelector('.flash-notification');
if (!flashNotification) {
    flashNotification = document.createElement('div');
    flashNotification.classList.add('flash-notification');
    document.body.appendChild(flashNotification);
}

function showFlashMessage(message, type = 'info') {
    flashNotification.textContent = message;
    flashNotification.classList.remove('success', 'error', 'info', 'show');
    flashNotification.classList.add(type, 'show');
    
    setTimeout(() => {
        hideFlashMessage();
    }, 5000);
}

function hideFlashMessage() {
    flashNotification.classList.remove('show');
    flashNotification.textContent = '';
}

function getFileNameFromPath(path) {
    const parts = path.split('/');
    return parts[parts.length - 1];
}

// --- UI Update Logic ---

function updateUIForAuthState(user) {
    const loggedOutActions = document.querySelector('.logged-out-actions');
    const loggedInActions = document.querySelector('.logged-in-actions');
    const userProfilePicElement = document.querySelector('.profile-pic');
    const userNameElement = document.querySelector('.user-name');
    const logoutBtn = document.querySelector('.logout-btn');

    // Mobile menu elements
    const mobileUserStatus = document.querySelector('.mobile-user-status');
    const mobileProfilePicElement = mobileUserStatus ? mobileUserStatus.querySelector('.profile-pic-mobile') : null;
    const mobileLoginBtn = mobileUserStatus ? mobileUserStatus.querySelector('.login-btn-mobile') : null;
    const loggedOutActionsMobile = document.querySelector('.logged-out-actions-mobile');
    const loggedInActionsMobile = document.querySelector('.logged-in-actions-mobile');
    const mobileMenuProfilePicElement = document.querySelector('.mobile-menu-overlay .user-profile .profile-pic');
    const mobileMenuUserNameElement = document.querySelector('.mobile-menu-overlay .user-profile .user-name');
    const mobileLogoutBtnFromOverlay = document.querySelector('.mobile-menu-overlay .logout-btn');

    // Community page specific elements
    const communityContentWrapper = document.querySelector('.community-content-wrapper');
    const loginRequiredMessage = document.querySelector('.login-required-message');

    const currentEffectiveFileName = getFileNameFromPath(window.location.pathname);

    if (user) {
        // User is signed in
        console.log('User is logged in:', user.email);

        // Update localStorage (for older parts of the system or direct checks)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', user.displayName || user.email);
        localStorage.setItem('userProfilePic', user.photoURL || '../public/images/fotos-perfil/default-avatar.png');

        // Update desktop navbar
        if (loggedOutActions) loggedOutActions.classList.add('hidden');
        if (loggedInActions) loggedInActions.classList.remove('hidden');
        if (userProfilePicElement) userProfilePicElement.src = user.photoURL || '../public/images/fotos-perfil/default-avatar.png';
        if (userNameElement) userNameElement.textContent = user.displayName || user.email;

        // Update mobile header status
        if (mobileUserStatus) {
            if (mobileProfilePicElement) {
                mobileProfilePicElement.src = user.photoURL || '../public/images/fotos-perfil/default-avatar.png';
                mobileProfilePicElement.classList.remove('hidden');
            }
            if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
        }

        // Update mobile menu overlay
        if (loggedOutActionsMobile) loggedOutActionsMobile.classList.add('hidden');
        if (loggedInActionsMobile) loggedInActionsMobile.classList.remove('hidden');
        if (mobileMenuProfilePicElement) mobileMenuProfilePicElement.src = user.photoURL || '../public/images/fotos-perfil/default-avatar.png';
        if (mobileMenuUserNameElement) mobileMenuUserNameElement.textContent = user.displayName || user.email;

        // Community page specific logic
        if (currentEffectiveFileName === 'comunidade.html') {
            if (communityContentWrapper) communityContentWrapper.classList.remove('hidden');
            if (loginRequiredMessage) loginRequiredMessage.classList.add('hidden');
            
            // Populate community profile section
            const profileCardPic = document.querySelector('.profile-card-pic');
            const profileCardName = document.querySelector('.profile-card-name');
            if (profileCardPic) profileCardPic.src = user.photoURL || '../public/images/fotos-perfil/default-avatar.png';
            if (profileCardName) profileCardName.textContent = user.displayName || user.email;

            // Simulate user data for the community page (replace with actual data fetch in production)
            const userData = JSON.parse(localStorage.getItem('userData')) || {
                contributions: 15,
                ratings: 23,
                points: 1250,
            };
            localStorage.setItem('userData', JSON.stringify(userData));

            const userContributions = document.getElementById('user-contributions');
            const userRatings = document.getElementById('user-ratings');
            const userPoints = document.getElementById('user-points');

            if (userContributions) userContributions.textContent = userData.contributions;
            if (userRatings) userRatings.textContent = userData.ratings;
            if (userPoints) userPoints.textContent = userData.points;
        }

    } else {
        // User is signed out
        console.log('User is logged out.');

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userProfilePic');
        localStorage.removeItem('userData'); // Clear simulated user data

        // Update desktop navbar
        if (loggedOutActions) loggedOutActions.classList.remove('hidden');
        if (loggedInActions) loggedInActions.classList.add('hidden');

        // Update mobile header status
        if (mobileUserStatus) {
            if (mobileProfilePicElement) mobileProfilePicElement.classList.add('hidden');
            if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
        }

        // Update mobile menu overlay
        if (loggedOutActionsMobile) loggedOutActionsMobile.classList.remove('hidden');
        if (loggedInActionsMobile) loggedInActionsMobile.classList.add('hidden');

        // Community page specific logic
        if (currentEffectiveFileName === 'comunidade.html') {
            if (communityContentWrapper) communityContentWrapper.classList.add('hidden');
            if (loginRequiredMessage) loginRequiredMessage.classList.remove('hidden');
            
            // Redirect to login page if on a restricted page and not logged in
            // (Optional, uncomment if you want immediate redirect)
            // if (currentEffectiveFileName === 'comunidade.html') {
            //     showFlashMessage('Você precisa estar logado para acessar a comunidade.', 'error');
            //     window.location.href = 'login.html';
            // }
            // Redireciona para a página de login ou home após logout
            window.location.href = 'user/login.html?from=community';
        }
    }
}

// --- Firebase Auth State Listener ---
auth.onAuthStateChanged((user) => {
    updateUIForAuthState(user);
});

// --- Logout functionality ---
// This assumes there's a .logout-btn in your HTML that will trigger this
document.addEventListener('click', (e) => {
    if (e.target.closest('.logout-btn')) {
        auth.signOut().then(() => {
            showFlashMessage('Você foi desconectado.', 'info');
            // Redireciona para a página inicial após o logout
            if (window.location.pathname.includes('/views/')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
        }).catch((error) => {
            console.error('Error during logout:', error);
            showFlashMessage('Erro ao desconectar. Tente novamente.', 'error');
        });
    }
}); 