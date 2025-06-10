/* Wacs Remaster/public/js/login.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lógica para o formulário de login e autenticação com Google será adicionada aqui.
    // Por exemplo, tratamento do envio do formulário, integração com Firebase Auth, etc.

    const loginForm = document.querySelector('.login-form');
    const googleLoginBtn = document.querySelector('.google-login-btn');
    const html = document.documentElement; // Referência ao elemento <html>

    // Lógica para aplicar o tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        html.classList.add('light-theme');
    } else {
        // Por padrão, se não houver tema salvo ou for 'dark', remove a classe light-theme
        html.classList.remove('light-theme');
    }

    // Função simulada de login
    const simulateLogin = (username, profilePicUrl) => {
        // Salva o status de login e dados do usuário no localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', username);
        localStorage.setItem('userProfilePic', profilePicUrl);

        // Redireciona para a página inicial após um pequeno atraso
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000); // Simula um atraso de 1 segundo
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Formulário de login enviado.');
            // Simula login bem-sucedido com email/senha
            simulateLogin('Usuário Teste', 'https://i.pravatar.cc/150?img=68'); // Foto de perfil simulada
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            console.log('Botão Logar com o Google clicado.');
            // Simula login bem-sucedido com Google
            simulateLogin('Usuário Google', 'https://i.pravatar.cc/150?img=50'); // Outra foto de perfil simulada
        });
    }
}); 