document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el carrusel de Swiper
    const swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        // Responsive breakpoints
        breakpoints: {
            // cuando la ventana es >= 640px
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            // cuando la ventana es >= 968px
            968: {
                slidesPerView: 3,
                spaceBetween: 30
            }
        }
    });

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

    // Manejar clics en las tarjetas de lugares
    const placeCards = document.querySelectorAll('.place-card');
    const verEnMapaBtns = document.querySelectorAll('.ver-en-mapa');

    // Agregar evento click a cada tarjeta
    placeCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Evitar que el clic en el botón "Ver en Mapa" también dispare este evento
            if (e.target.closest('.ver-en-mapa')) {
                return;
            }

            const lat = this.dataset.lat;
            const lon = this.dataset.lon;
            const name = this.dataset.name;
            
            // Redirigir a index.html con los parámetros para mostrar en el mapa
            redirigirAMapa(lat, lon, name);
        });
    });

    // Agregar evento click a cada botón "Ver en Mapa"
    verEnMapaBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar la propagación del evento
            
            const card = this.closest('.place-card');
            const lat = card.dataset.lat;
            const lon = card.dataset.lon;
            const name = card.dataset.name;
            
            // Redirigir a index.html con los parámetros para mostrar en el mapa
            redirigirAMapa(lat, lon, name);
        });
    });

    // Función para redirigir a la página del mapa con los parámetros
    function redirigirAMapa(lat, lon, name) {
        const params = new URLSearchParams();
        params.append('destLat', lat);
        params.append('destLon', lon);
        params.append('destName', name);
        
        window.location.href = `index.html?${params.toString()}`;
    }
});