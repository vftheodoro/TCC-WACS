// Lista todos os usuários do Firestore e permite busca

(function () {
    function initializeFirebase() {
        try {
            if (!window.ENV) return null;
            if (!window.firebase) return null;
            if (!firebase.apps.length) {
                firebase.initializeApp({
                    apiKey: window.ENV.FIREBASE_API_KEY,
                    authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
                    projectId: window.ENV.FIREBASE_PROJECT_ID,
                    storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
                    messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
                    appId: window.ENV.FIREBASE_APP_ID,
                    measurementId: window.ENV.FIREBASE_MEASUREMENT_ID
                });
            }
            return window.firebase;
        } catch (e) {
            console.error('Erro ao inicializar Firebase:', e);
            return null;
        }
    }

    function resolveDefaultAvatar() {
        const path = window.location.pathname || '';
        if (path.includes('/views/')) {
            return '../public/images/fotos-perfil/default-avatar.png';
        }
        return '/public/images/fotos-perfil/default-avatar.png';
    }

    function createUserCard(userData) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.style.cssText = `
            background: var(--card-background);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
        `;

        if (!userData) {
            card.innerHTML = '<div style="height:100%;width:100%"></div>';
            return card;
        }

        const photo = userData.photoURL || userData.photo || resolveDefaultAvatar();
        const name = userData.displayName || userData.name || userData.email || 'Usuário';
        const email = userData.email || '';
        
        // Verificar se o usuário é administrador
        const isAdmin = userData.ADM === 1 || userData.ADM === '1' || userData.ADM === true;
        
        // Definir role baseado no status de administrador
        const role = isAdmin ? 'ADM' : 'User';

        card.innerHTML = `
            <img src="${photo}" alt="Foto de ${name}" class="user-card-avatar" loading="lazy" onerror="this.onerror=null;this.src='${resolveDefaultAvatar()}'" style="
                width: 80px;
                height: 80px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid var(--gradient-start);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            ">
            <div class="user-card-info" style="flex: 1; min-width: 0;">
                <h3 class="user-card-name" style="
                    margin: 0 0 8px 0;
                    font-size: 1.1em;
                    font-weight: 600;
                    color: var(--text-color);
                    word-break: break-word;
                " title="${name}">${name}</h3>
                <p class="user-card-role" style="
                    margin: 0 0 8px 0;
                    font-size: 0.9em;
                    color: var(--gradient-start);
                    font-weight: 500;
                " title="${role}">${role}</p>
                ${email ? `<p class="user-card-email" style="
                    margin: 0;
                    font-size: 0.8em;
                    color: var(--text-color);
                    opacity: 0.7;
                    word-break: break-word;
                " title="${email}">${email}</p>` : ''}
            </div>
        `;

        // Adicionar hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });

        return card;
    }

    async function loadAllUsers() {
        const container = document.getElementById('users-list');
        const empty = document.getElementById('users-empty');
        if (!container) return;
        container.innerHTML = '';

        const firebase = initializeFirebase();
        if (!firebase) return;

        const db = firebase.firestore();
        try {
            const snap = await db.collection('users').get();
            if (snap.empty) {
                if (empty) empty.style.display = '';
                return;
            }
            const users = [];
            snap.forEach(doc => users.push(doc.data()));
            
            // Ordenar usuários alfabeticamente
            const sortedUsers = users.sort((a, b) => {
                const nameA = (a.displayName || a.name || a.email || '').toLowerCase();
                const nameB = (b.displayName || b.name || b.email || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            
            window.__ALL_USERS = sortedUsers;
            renderUsers(sortedUsers);
        } catch (e) {
            console.error('Erro ao carregar usuários:', e);
            if (empty) empty.style.display = '';
        }
    }

    function renderUsers(users) {
        const container = document.getElementById('users-list');
        const empty = document.getElementById('users-empty');
        if (!container) return;
        container.innerHTML = '';
        if (!users || users.length === 0) {
            if (empty) empty.style.display = '';
            return;
        }
        if (empty) empty.style.display = 'none';

        // Ordenar usuários alfabeticamente por nome
        const sortedUsers = [...users].sort((a, b) => {
            const nameA = (a.displayName || a.name || a.email || '').toLowerCase();
            const nameB = (b.displayName || b.name || b.email || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        // Criar container de grid com 3 colunas fixas
        const gridContainer = document.createElement('div');
        gridContainer.className = 'users-grid';
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            width: 100%;
        `;

        // Criar cards para cada usuário
        sortedUsers.forEach(user => {
            if (user) {
                const userCard = createUserCard(user);
                gridContainer.appendChild(userCard);
            }
        });

        container.appendChild(gridContainer);
    }

    function setupSearch() {
        const input = document.getElementById('users-search-input');
        const clearBtn = document.getElementById('users-search-clear');
        if (!input) return;

        function applyFilter() {
            const term = (input.value || '').toLowerCase().trim();
            if (clearBtn) clearBtn.style.display = term ? '' : 'none';
            const base = window.__ALL_USERS || [];
            let filtered = term ? base.filter(u => {
                const name = (u.displayName || u.name || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                return name.includes(term) || email.includes(term);
            }) : base;
            
            // Ordenar alfabeticamente os resultados da busca
            filtered = filtered.sort((a, b) => {
                const nameA = (a.displayName || a.name || a.email || '').toLowerCase();
                const nameB = (b.displayName || b.name || b.email || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            
            renderUsers(filtered);
        }

        input.addEventListener('input', applyFilter);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                applyFilter();
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Só roda nesta página
        if (!window.location.pathname.includes('usuarios.html')) return;
        setupSearch();
        // Garante que Firebase esteja disponível antes de buscar
        const wait = setInterval(() => {
            if (typeof firebase !== 'undefined' && window.ENV) {
                clearInterval(wait);
                firebase.auth().onAuthStateChanged(() => {
                    loadAllUsers();
                });
            }
        }, 100);
        setTimeout(() => clearInterval(wait), 10000);
    });
})();


