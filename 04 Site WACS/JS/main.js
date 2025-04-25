/**
 * WACS - JavaScript principal
 * Gerencia interatividade do menu mobile e elementos UIverse
 */
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Elementos UIverse
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    const contactForm = document.querySelector('.contact-form form');
    const formLoadingState = document.querySelector('.form-loading-state');
    const card3d = document.querySelector('.card-3d');
    const appLoader = document.getElementById('app-loader');
    
    // Scroll suave para âncoras internas
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    // Toggle do menu mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Controle de acessibilidade
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !expanded);
        });
    }
    
    // Simular carregamento na seção de app
    if (appLoader) {
        setTimeout(() => {
            appLoader.style.display = 'none';
            document.querySelector('.app-preview').style.display = 'grid';
        }, 2000);
    }
    
    // Fecha o menu ao clicar em um link
    if (navLinks) {
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    
    // Scroll suave para links internos
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerOffset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Destaque de navegação baseado no scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        // Destaca o item de menu ativo
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // Adiciona classe para mudar estilo da navbar no scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrollPosition > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
    
    // Animação de elementos ao entrar na viewport
    const animateOnScroll = () => {
        // Elementos originais
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animated');
            }
        });
        
        // Elementos UIverse scroll-reveal
        scrollRevealElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('revealed');
            }
        });
    };
    
    // Efeito 3D nos cards
    if (card3d) {
        card3d.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = card3d.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            card3d.style.transform = `
                perspective(1000px)
                rotateX(${y * 10}deg)
                rotateY(${x * 10}deg)
                scale3d(1.05, 1.05, 1.05)
            `;
        });
        
        card3d.addEventListener('mouseleave', () => {
            card3d.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    }
    
    // Gerenciar formulário de contato
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Mostrar estado de carregamento
            formLoadingState.style.display = 'flex';
            contactForm.querySelector('button[type="submit"]').disabled = true;
            
            // Simular envio
            setTimeout(() => {
                formLoadingState.style.display = 'none';
                contactForm.reset();
                contactForm.querySelector('button[type="submit"]').disabled = false;
                
                // Mostrar mensagem de sucesso
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Mensagem enviada com sucesso!';
                contactForm.appendChild(successMessage);
                
                // Remover mensagem após alguns segundos
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
            }, 2000);
        });
    }
    
    // Botões com efeito ripple
    const rippleButtons = document.querySelectorAll('.btn-pulse');
    rippleButtons.forEach(button => {
        button.addEventListener('mousedown', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Adiciona animação inicial
    setTimeout(animateOnScroll, 300);
    
    // Continua verificando durante o scroll
    window.addEventListener('scroll', animateOnScroll);
});
