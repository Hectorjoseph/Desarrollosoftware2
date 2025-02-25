document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("ubicacion-btn").addEventListener("click", obtenerUbicacion);
    document.getElementById("lugares-btn").addEventListener("click", () => {
        const tiposSeleccionados = Array.from(document.querySelectorAll('.filter-options input[type="checkbox"]:checked')).map(cb => cb.value);
        if (tiposSeleccionados.length === 0) {
            mostrarNotificacion("Selecciona al menos un tipo de lugar", "warning");
            return;
        }
        buscarLugaresCercanos(tiposSeleccionados);
    });

    initMap();
});
