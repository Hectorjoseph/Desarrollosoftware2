
document.addEventListener("DOMContentLoaded", function() {
    // Elementos del DOM
    const ubicacionBtn = document.getElementById("ubicacion-btn");
    const lugaresBtn = document.getElementById("lugares-btn");
    const mapaDiv = document.getElementById("mapa");
    const weatherInfo = document.getElementById("weather-info");
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');

    // Variables globales
    let selectedArea = null;
    let routingControl = null;
    let activeRoute = null;
    let highlightedAreas = [];

    // Inicializar el mapa con los nuevos plugins
    function initMap() {
        map = L.map('mapa').setView([4.7110, -74.0721], 13); // Coordenadas de Bogotá, Colombia
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Inicializar el control de rutas
        routingControl = L.Routing.control({
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            lineOptions: {
                styles: [{color: '#6FA1EC', weight: 4}]
            },
            createMarker: function() { return null; }
        }).addTo(map);
    }


    // Función mejorada para crear marcadores de lugares
    function crearMarcadorLugar(place) {
        const areaRadius = 150; // Radio en metros para el área destacada
        
        // Crear el marcador
        const marker = L.marker([place.lat, place.lon], {
            title: place.tags.name || 'Lugar sin nombre'
        }).addTo(map);

        // Crear área circular destacada
        const area = L.circle([place.lat, place.lon], {
            radius: areaRadius,
            color: '#4CAF50',
            fillColor: '#4CAF50',
            fillOpacity: 0.2,
            weight: 1
        }).addTo(map);

        // Calcular tiempo estimado de llegada
        const tiempoEstimado = calcularTiempoEstimado(
            [lat, lon],
            [place.lat, place.lon]
        );

        const popupContent = `
            <div class="info-window">
                <h3>${place.tags.name || 'Lugar sin nombre'}</h3>
                <p>${place.tags.amenity || place.tags.leisure || place.tags.tourism}</p>
                ${place.tags.opening_hours ? `<p>Horario: ${place.tags.opening_hours}</p>` : ''}
                <p>Tiempo estimado: ${tiempoEstimado}</p>
                <button onclick="window.mostrarRuta(${place.lat}, ${place.lon})" 
                        class="route-button">
                    <i class="fas fa-route"></i> Mostrar ruta
                </button>
                <button onclick="window.focusArea(${place.lat}, ${place.lon})" 
                        class="focus-button">
                    <i class="fas fa-search-location"></i> Enfocar área
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);
        
        // Guardar referencias
        markers.push(marker);
        highlightedAreas.push(area);

        // Eventos de hover
        marker.on('mouseover', () => {
            area.setStyle({fillOpacity: 0.4});
        });
        
        marker.on('mouseout', () => {
            if (!selectedArea || selectedArea !== area) {
                area.setStyle({fillOpacity: 0.2});
            }
        });
    }

    // Calcular tiempo estimado de llegada
    function calcularTiempoEstimado(desde, hasta) {
        // Calcular distancia en metros
        const distancia = map.distance(desde, hasta);
        
        // Velocidad promedio caminando (en metros por minuto)
        const velocidadCaminando = 80;
        
        // Calcular tiempo en minutos
        const minutos = Math.round(distancia / velocidadCaminando);
        
        if (minutos < 60) {
            return `${minutos} minutos caminando`;
        } else {
            const horas = Math.floor(minutos / 60);
            const minutosRestantes = minutos % 60;
            return `${horas}h ${minutosRestantes}min caminando`;
        }
    }

    // Mostrar ruta hacia un lugar
    window.mostrarRuta = function(destLat, destLon) {
        if (routingControl && activeRoute) {
            map.removeControl(activeRoute);
        }

        activeRoute = L.Routing.control({
            waypoints: [
                L.latLng(lat, lon),
                L.latLng(destLat, destLon)
            ],
            router: L.Routing.osrm({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            }),
            lineOptions: {
                styles: [{color: '#6FA1EC', weight: 4}]
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            createMarker: function() { return null; }
        }).addTo(map);

        mostrarNotificacion("Calculando mejor ruta...", "info");
    };

    // Enfocar área específica
    window.focusArea = function(areaLat, areaLon) {
        // Limpiar áreas previamente seleccionadas
        highlightedAreas.forEach(area => {
            area.setStyle({fillOpacity: 0.2, color: '#4CAF50'});
        });

        // Encontrar y resaltar el área seleccionada
        const areaSeleccionada = highlightedAreas.find(area => {
            const center = area.getLatLng();
            return center.lat === areaLat && center.lng === areaLon;
        });

        if (areaSeleccionada) {
            // Resaltar área seleccionada
            areaSeleccionada.setStyle({
                fillOpacity: 0.5,
                color: '#FFC107'
            });

            // Ajustar el mapa
            map.flyTo([areaLat, areaLon], 16, {
                duration: 1.5,
                easeLinearity: 0.25
            });

            selectedArea = areaSeleccionada;
        }
    };

    // Función mejorada para limpiar el mapa
    function limpiarMarcadores() {
        markers.forEach(marker => map.removeLayer(marker));
        highlightedAreas.forEach(area => map.removeLayer(area));
        if (activeRoute) {
            map.removeControl(activeRoute);
            activeRoute = null;
        }
        markers = [];
        highlightedAreas = [];
        selectedArea = null;
    }

    // Obtener ubicación actual
    ubicacionBtn.addEventListener("click", function() {
        if (navigator.geolocation) {
            ubicacionBtn.disabled = true;
            ubicacionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...';
            
            navigator.geolocation.getCurrentPosition(
                mostrarUbicacion,
                mostrarError,
                { enableHighAccuracy: true }
            );
        } else {
            mostrarNotificacion("Tu navegador no soporta geolocalización", "error");
        }
    });

    // Mostrar lugares de interés usando Overpass API (API gratuita de OpenStreetMap)
    lugaresBtn.addEventListener("click", async function() {
        if (lat && lon) {
            const tiposSeleccionados = Array.from(filterCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            
            if (tiposSeleccionados.length === 0) {
                mostrarNotificacion("Selecciona al menos un tipo de lugar", "warning");
                return;
            }

            await buscarLugaresCercanos(tiposSeleccionados);
        } else {
            mostrarNotificacion("Primero debes obtener tu ubicación", "warning");
        }
    });

    // Mostrar ubicación en el mapa
    function mostrarUbicacion(posicion) {
        lat = posicion.coords.latitude;
        lon = posicion.coords.longitude;
        
        map.setView([lat, lon], 15);
        
        // Actualizar marcador de ubicación actual
        if (marker) {
            map.removeLayer(marker);
        }
        
        marker = L.marker([lat, lon], {
            title: "Tu ubicación"
        }).addTo(map);

        // Obtener información del clima usando una API gratuita
        obtenerClima(lat, lon);
        
        ubicacionBtn.disabled = false;
        ubicacionBtn.innerHTML = '<i class="fas fa-location-dot"></i> Actualizar ubicación';
        
        mostrarNotificacion("Ubicación actualizada correctamente", "success");
    }

    // Buscar lugares cercanos usando Overpass API
    async function buscarLugaresCercanos(tipos) {
        limpiarMarcadores();
        mostrarNotificacion("Buscando lugares cercanos...", "info");

        const tiposOSM = {
            restaurant: 'amenity=restaurant',
            park: 'leisure=park',
            museum: 'tourism=museum',
            cafe: 'amenity=cafe'
        };

        const query = `
            [out:json][timeout:25];
            (
                ${tipos.map(tipo => `
                    node[${tiposOSM[tipo]}](around:1500,${lat},${lon});
                    way[${tiposOSM[tipo]}](around:1500,${lat},${lon});
                    relation[${tiposOSM[tipo]}](around:1500,${lat},${lon});
                `).join('')}
            );
            out body;
            >;
            out skel qt;
        `;

        try {
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });
            const data = await response.json();
            
            data.elements.forEach(element => {
                if (element.type === 'node' && element.tags) {
                    crearMarcadorLugar(element);
                }
            });
        } catch (error) {
            mostrarNotificacion("Error al buscar lugares cercanos", "error");
        }
    }

    // Crear marcador para un lugar
    function crearMarcadorLugar(place) {
        const marker = L.marker([place.lat, place.lon], {
            title: place.tags.name || 'Lugar sin nombre'
        }).addTo(map);

        const popupContent = `
            <div class="info-window">
                <h3>${place.tags.name || 'Lugar sin nombre'}</h3>
                <p>${place.tags.amenity || place.tags.leisure || place.tags.tourism}</p>
                ${place.tags.opening_hours ? `<p>Horario: ${place.tags.opening_hours}</p>` : ''}
                ${place.tags.phone ? `<p>Teléfono: ${place.tags.phone}</p>` : ''}
                <a href="https://www.openstreetmap.org/${place.type}/${place.id}" target="_blank">
                    Ver más detalles
                </a>
            </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
    }

    // Obtener información del clima usando una API gratuita
    async function obtenerClima(lat, lon) {
        try {
            // Usando Open-Meteo (API gratuita sin key)
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            const data = await response.json();

            weatherInfo.innerHTML = `
                <h3>Clima actual</h3>
                <div class="weather-content">
                    <i class="fas ${obtenerIconoClima(data.current_weather.weathercode)}"></i>
                    <div>
                        <p>${data.current_weather.temperature}°C</p>
                        <p>Viento: ${data.current_weather.windspeed} km/h</p>
                    </div>
                </div>
            `;
        } catch (error) {
            weatherInfo.innerHTML = `
                <h3>Clima actual</h3>
                <p>No se pudo obtener la información del clima</p>
            `;
        }
    }

    // Obtener icono del clima según el código
    function obtenerIconoClima(code) {
        const iconos = {
            0: 'fa-sun', // Despejado
            1: 'fa-cloud-sun', // Parcialmente nublado
            2: 'fa-cloud', // Nublado
            3: 'fa-cloud', // Nublado
            45: 'fa-smog', // Niebla
            48: 'fa-smog', // Niebla
            51: 'fa-cloud-rain', // Lluvia ligera
            53: 'fa-cloud-rain', // Lluvia moderada
            55: 'fa-cloud-showers-heavy', // Lluvia intensa
            61: 'fa-cloud-rain', // Lluvia
            63: 'fa-cloud-rain', // Lluvia
            65: 'fa-cloud-showers-heavy', // Lluvia intensa
            71: 'fa-snowflake', // Nieve
            73: 'fa-snowflake', // Nieve
            75: 'fa-snowflake', // Nieve intensa
            95: 'fa-bolt', // Tormenta
        };
        return iconos[code] || 'fa-cloud';
    }

    // Mostrar error de geolocalización
    function mostrarError(error) {
        ubicacionBtn.disabled = false;
        ubicacionBtn.innerHTML = '<i class="fas fa-location-dot"></i> Obtener mi ubicación';
        
        let mensaje = "No se pudo obtener la ubicación";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                mensaje = "Acceso a la ubicación denegado";
                break;
            case error.POSITION_UNAVAILABLE:
                mensaje = "Información de ubicación no disponible";
                break;
            case error.TIMEOUT:
                mensaje = "Tiempo de espera agotado";
                break;
        }
        mostrarNotificacion(mensaje, "error");
    }

    // Limpiar marcadores del mapa
    function limpiarMarcadores() {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    }

    // Sistema de notificaciones
    function mostrarNotificacion(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${obtenerIconoNotificacion(tipo)}"></i>
                <span>${mensaje}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    function obtenerIconoNotificacion(tipo) {
        switch(tipo) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-times-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Inicializar el mapa
    initMap();
});