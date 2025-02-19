document.addEventListener('DOMContentLoaded', function() {
    // Mantener el header visible al hacer scroll
    const header = document.querySelector('.fixed-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scroll Down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scroll Up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Animación de números en las estadísticas
    const statsSection = document.querySelector('.stats-section');
    let animated = false;

    function animateNumbers() {
        if (animated) return;
        
        const stats = document.querySelectorAll('.stat-card h3');
        stats.forEach(stat => {
            const target = parseInt(stat.innerText.replace(/[^0-9]/g, ''));
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    current = target;
                }
                stat.innerText = `+${Math.floor(current)}`;
                if (stat.innerText.includes('98')) {
                    stat.innerText = '98%';
                }
            }, 20);
        });
        animated = true;
    }

    // Observador para activar la animación cuando la sección es visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
            }
        });
    });

    observer.observe(statsSection);
});