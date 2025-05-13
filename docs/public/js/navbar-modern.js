// Navbar moderno adaptado do Site Base

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const navbar = document.getElementById('navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    const mobileDropdowns = document.querySelectorAll('.mobile-dropdown');
    
    // Elementos de autenticação
    const loginLink = document.getElementById('loginLink');
    const profileLink = document.getElementById('profileLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const navbarDivider = document.getElementById('navbarDivider');
    const authLinks = document.getElementById('authLinks');
    
    // Elementos de autenticação mobile
    const loginLinkMobile = document.getElementById('loginLinkMobile');
    const profileLinkMobile = document.getElementById('profileLinkMobile');
    const dashboardLinkMobile = document.getElementById('dashboardLinkMobile');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    const mobileDivider = document.getElementById('mobileDivider');
    const authLinksMobile = document.getElementById('authLinksMobile');
    
    // Função para atualizar a navbar baseado no estado de autenticação
    function updateNavbarAuthState(isAuthenticated) {
        if (isAuthenticated) {
            // Desktop
            loginLink.classList.add('hidden');
            profileLink.classList.remove('hidden');
            dashboardLink.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            navbarDivider.classList.remove('hidden');
            authLinks.classList.remove('hidden');
            
            // Mobile
            loginLinkMobile.classList.add('hidden');
            profileLinkMobile.classList.remove('hidden');
            dashboardLinkMobile.classList.remove('hidden');
            logoutBtnMobile.classList.remove('hidden');
            mobileDivider.classList.remove('hidden');
            authLinksMobile.classList.remove('hidden');
        } else {
            // Desktop
            loginLink.classList.remove('hidden');
            profileLink.classList.add('hidden');
            dashboardLink.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            navbarDivider.classList.add('hidden');
            authLinks.classList.add('hidden');
            
            // Mobile
            loginLinkMobile.classList.remove('hidden');
            profileLinkMobile.classList.add('hidden');
            dashboardLinkMobile.classList.add('hidden');
            logoutBtnMobile.classList.add('hidden');
            mobileDivider.classList.add('hidden');
            authLinksMobile.classList.add('hidden');
        }
    }
    
    // Verificar estado de autenticação ao carregar a página
    firebase.auth().onAuthStateChanged(function(user) {
        updateNavbarAuthState(!!user);
    });
    
    // Detectar se é dispositivo móvel
    const isMobile = window.innerWidth <= 768;
    
    // Função para ajustar o navbar durante o scroll
    function handleScroll() {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Adiciona evento de scroll
    window.addEventListener('scroll', handleScroll);
    
    // Toggle do menu mobile
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        
        // Anima o ícone do hamburguer menu
        const spans = this.querySelectorAll('span');
        if (mobileMenu.classList.contains('active')) {
            spans[0].style.transform = 'translateY(8px) rotate(45deg)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Controle de dropdowns desktop
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        // Eventos para toque/clique (principalmente para mobile)
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Em dispositivos móveis, queremos comportamento toggle
            if (isMobile) {
                dropdown.classList.toggle('active');
            } else {
                // Em desktop, se já estiver ativo, desativa
                if (dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                } else {
                    // Fecha outros dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) other.classList.remove('active');
                    });
                    
                    // Ativa o atual
                    dropdown.classList.add('active');
                }
            }
        });
        
        // Eventos de mouse para desktop
        if (!isMobile) {
            // Abrir ao passar o mouse
            dropdown.addEventListener('mouseenter', function() {
                dropdowns.forEach(other => {
                    if (other !== dropdown) other.classList.remove('active');
                });
                dropdown.classList.add('active');
            });
            
            // Fechar quando o mouse sai
            dropdown.addEventListener('mouseleave', function() {
                dropdown.classList.remove('active');
            });
        }
    });
    
    // Controle de dropdowns mobile
    mobileDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.mobile-dropdown-toggle');
        
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            dropdown.classList.toggle('active');
        });
    });
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', function(e) {
        // Fecha dropdowns desktop
        dropdowns.forEach(dropdown => {
            const isClickInside = dropdown.contains(e.target);
            if (!isClickInside) {
                dropdown.classList.remove('active');
            }
        });
        
        // Não fecha o menu mobile ao clicar dentro dele
        if (mobileMenu.classList.contains('active')) {
            const isClickInsideMobileMenu = mobileMenu.contains(e.target);
            const isClickOnMenuToggle = menuToggle.contains(e.target);
            
            if (!isClickInsideMobileMenu && !isClickOnMenuToggle) {
                mobileMenu.classList.remove('active');
                
                // Restaura o ícone do menu
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
    
    // Links de âncora com scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Não previne o comportamento padrão para links de dropdown
            if (this.classList.contains('dropdown-toggle') || 
                this.classList.contains('mobile-dropdown-toggle')) {
                return;
            }
            
            e.preventDefault();
            
            // Fecha o menu mobile se estiver aberto
            if (mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
            
            // Scroll suave até o elemento alvo
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Ignora links vazios
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Ajuste para compensar altura do navbar
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Ajustar para mudanças de tamanho da janela
    window.addEventListener('resize', function() {
        const wasMobile = isMobile;
        const nowMobile = window.innerWidth <= 768;
        
        // Se mudou entre mobile e desktop, atualize o estado
        if (wasMobile !== nowMobile) {
            location.reload(); // Recarrega a página para aplicar os comportamentos corretos
        }
    });
});
