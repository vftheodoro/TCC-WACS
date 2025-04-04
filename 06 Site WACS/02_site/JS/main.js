// Adicionar após o smooth scroll
// Animação de Reveal
function revealElements() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealElements);
window.addEventListener('load', revealElements);
// Observador de Intersecção para Animações
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px'
});

// Aplicar a todos os elementos reveal
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Efeito Hover para Cards
document.querySelectorAll('.card, .produto-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.transform = `
            perspective(1000px)
            rotateX(${-(y - rect.height/2)/15}deg)
            rotateY(${(x - rect.width/2)/15}deg)
        `;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(-5px)';
    });
});