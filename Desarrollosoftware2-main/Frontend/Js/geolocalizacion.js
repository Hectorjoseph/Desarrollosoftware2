// location.js
document.addEventListener("DOMContentLoaded", function() {
    // Variables globales
    let map;
    let marker;
    let watchId;
    let lat;
    let lon;
    let accuracy;
    
    // Elementos del DOM
    const ubicacionBtn = document.getElementById("ubicacion-btn");
    const mapaDiv = document.getElementById("mapa");

    // Configuración de alta precisión para geolocalización
    const geoOptions = {
        enableHighAccuracy: true,  // Solicitar la mejor precisión posible
        maximumAge: 0,            // No usar ubicaciones en caché
        timeout: 20000,           // Tiempo máximo de espera (20 segundos)
        desiredAccuracy: 20       // Precisión deseada en metros
    };

    // Inicializar el mapa
    function initMap() {
        map = L.map('mapa').setView([4.7110, -74.0721], 13);
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Añadir escala al mapa
        L.control.scale().addTo(map);
    }

    // Iniciar seguimiento continuo de ubicación
    ubicacionBtn.addEventListener("click", function() {
        if (navigator.geolocation) {
            if (!watchId) {
                iniciarSeguimiento();
                ubicacionBtn.innerHTML = '<i class="fas fa-stop"></i> Detener seguimiento';
            } else {
                detenerSeguimiento();
                ubicacionBtn.innerHTML = '<i class="fas fa-location-dot"></i> Iniciar seguimiento';
            }
        } else {
            mostrarNotificacion("Tu navegador no soporta geolocalización", "error");
        }
    });

    function iniciarSeguimiento() {
        ubicacionBtn.disabled = true;
        ubicacionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando seguimiento...';
        
        // Obtener una primera ubicación inmediata
        navigator.geolocation.getCurrentPosition(
            mostrarUbicacion,
            mostrarError,
            geoOptions
        );

        // Iniciar seguimiento continuo
        watchId = navigator.geolocation.watchPosition(
            actualizarUbicacion,
            mostrarError,
            geoOptions
        );

        ubicacionBtn.disabled = false;
    }

    function detenerSeguimiento() {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
    }

    function actualizarUbicacion(posicion) {
        const nuevaAccuracy = posicion.coords.accuracy;
        
        // Solo actualizar si la precisión es mejor que la anterior
        if (!accuracy || nuevaAccuracy < accuracy) {
            mostrarUbicacion(posicion);
        }
    }

    function mostrarUbicacion(posicion) {
        lat = posicion.coords.latitude;
        lon = posicion.coords.longitude;
        accuracy = posicion.coords.accuracy;
        
        const radio = accuracy / 1;  // Radio en metros

        map.setView([lat, lon], getZoomLevel(accuracy));
        
        // Actualizar marcador y círculo de precisión
        if (marker) {
            map.removeLayer(marker);
        }
        
        marker = L.marker([lat, lon], {
            title: "Tu ubicación"
        }).addTo(map);

        // Añadir círculo de precisión
        const precisionCircle = L.circle([lat, lon], {
            radius: radio,
            color: '#ffffff',
            fillColor: '#dfdfdf',
            fillOpacity: 0.1,
            weight: 1
        }).addTo(map);

        // Popup con información de precisión
        marker.bindPopup(`
            <strong>Precisión:</strong> ±${Math.round(accuracy)} metros<br>
            <strong>Latitud:</strong> ${lat.toFixed(6)}<br>
            <strong>Longitud:</strong> ${lon.toFixed(6)}
        `).openPopup();

        mostrarNotificacion(`Ubicación actualizada (Precisión: ±${Math.round(accuracy)}m)`, "success");

        // Emitir evento con datos más completos
        const event = new CustomEvent('ubicacionActualizada', {
            detail: { 
                lat, 
                lon, 
                accuracy,
                timestamp: posicion.timestamp,
                altitude: posicion.coords.altitude,
                altitudeAccuracy: posicion.coords.altitudeAccuracy,
                heading: posicion.coords.heading,
                speed: posicion.coords.speed
            }
        });
        document.dispatchEvent(event);
    }

    // Calcular nivel de zoom basado en la precisión
    function getZoomLevel(accuracy) {
        if (accuracy <= 10) return 18;
        if (accuracy <= 50) return 17;
        if (accuracy <= 100) return 16;
        if (accuracy <= 500) return 15;
        if (accuracy <= 1000) return 14;
        return 13;
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

    // Exportar funciones y variables para uso externo
    window.mapFunctions = {
        getLocation: () => ({ lat, lon, accuracy }),
        getMap: () => map,
        getCurrentMarker: () => marker,
        startTracking: iniciarSeguimiento,
        stopTracking: detenerSeguimiento
    };
    // Inicializar el mapa
    initMap();
});