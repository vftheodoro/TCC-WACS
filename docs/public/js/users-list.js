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

    function createUserCell(userData) {
        const td = document.createElement('td');
        td.style.verticalAlign = 'top';
        td.style.padding = '10px';
        td.style.width = '33.3333%';

        if (!userData) {
            td.innerHTML = '<div style="height:100%;width:100%"></div>';
            return td;
        }

        const photo = userData.photoURL || userData.photo || resolveDefaultAvatar();
        const name = userData.displayName || userData.name || userData.email || 'Usuário';
        const role = userData.userRole || userData.profession || userData.mobilityType || 'Membro da Comunidade';
        const email = userData.email || '';

        td.innerHTML = `
            <div class="suggestion-item" style="display:flex; align-items:center; gap:10px;">
                <img src="${photo}" alt="Foto de ${name}" class="suggestion-pic" loading="lazy" onerror="this.onerror=null;this.src='${resolveDefaultAvatar()}'" style="flex:0 0 auto;">
                <div class="suggestion-info" style="min-width:0;">
                    <span class="suggestion-name" title="${name}">${name}</span>
                    <span class="suggestion-role" title="${role}">${role}</span>
                    ${email ? `<span style="font-size:.85em;color:#6b7280;">${email}</span>` : ''}
                </div>
            </div>
        `;
        return td;
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
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'separate';
        table.style.borderSpacing = '8px';

        // Calcular número de linhas necessárias para 3 colunas
        const totalUsers = sortedUsers.length;
        const numRows = Math.ceil(totalUsers / 3);

        for (let r = 0; r < numRows; r++) {
            const tr = document.createElement('tr');
            for (let c = 0; c < 3; c++) {
                const idx = r * 3 + c;
                const user = sortedUsers[idx];
                tr.appendChild(createUserCell(user));
            }
            table.appendChild(tr);
        }

        // Removida mensagem de limitação - agora mostra todos os usuários
        container.appendChild(table);
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


