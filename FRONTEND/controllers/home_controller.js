
document.addEventListener('DOMContentLoaded', async () => {
    await cargarMiniCalendario();
});

async function cargarMiniCalendario() {
    const grid = document.getElementById('mini-calendar-grid');
    const displayMes = document.getElementById('mini-calendar-month');
    
    if (!grid || !displayMes) return;

    // 1. Vamos por tus reseñas al backend
    let misResenas = [];
    try {
        const token = sessionStorage.getItem('token');
        if (token) {
            const respuesta = await fetch('http://localhost:3000/reviews/mis-resenas', {
                headers: { 'Authorization': token }
            });
            if (respuesta.ok) {
                misResenas = await respuesta.json();
            }
        }
    } catch (error) {
        console.error("Error al cargar actividad para el home", error);
    }

    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

   
    displayMes.textContent = `${meses[mes]} ${año}`;

   
    let htmlGrid = `
        <div class="cal-header">L</div>
        <div class="cal-header">M</div>
        <div class="cal-header">M</div>
        <div class="cal-header">J</div>
        <div class="cal-header">V</div>
        <div class="cal-header">S</div>
        <div class="cal-header">D</div>
    `;

    let primerDiaSemana = new Date(año, mes, 1).getDay();
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1; 
    const diasEnMes = new Date(año, mes + 1, 0).getDate();

    // 3. Rellenamos los huecos vacíos antes del día 1
    for (let i = 0; i < primerDiaSemana; i++) {
        htmlGrid += `<div class="cal-day empty"></div>`;
    }

    // 4. Dibujamos los días reales
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const mesString = String(mes + 1).padStart(2, '0');
        const diaString = String(dia).padStart(2, '0');
        const fechaCelda = `${año}-${mesString}-${diaString}`;

        // Verificamos si en este día viste/reseñaste algo
       const peliculasDelDia = misResenas.filter(resena => {
            let fechaComparar = "";
            
            if (resena.watchedAt) {
                fechaComparar = resena.watchedAt.substring(0, 10);
            } else {
                const fechaCreacion = new Date(resena.createdAt);
                const año = fechaCreacion.getFullYear();
                const mes = String(fechaCreacion.getMonth() + 1).padStart(2, '0');
                const dia = String(fechaCreacion.getDate()).padStart(2, '0');
                fechaComparar = `${año}-${mes}-${dia}`;
            }

            return fechaComparar === fechaCelda;
        });

        if (peliculasDelDia.length > 0) {
            
            htmlGrid += `<div class="cal-day has-activity" title="${peliculasDelDia.length} película(s) vista(s)" style="cursor: pointer;" onclick="window.location.href='calendar.html'">${dia}</div>`;
        } else {
           
            htmlGrid += `<div class="cal-day">${dia}</div>`;
        }
    }

    grid.innerHTML = htmlGrid;
}