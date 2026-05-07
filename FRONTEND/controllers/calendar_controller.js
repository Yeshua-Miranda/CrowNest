
let fechaActual = new Date(); 
let misResenas = []; 
let intervaloSlider = null;

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerMisResenas();
    renderizarCalendario();    
    configurarBotonesMes();    
});


async function obtenerMisResenas() {
    try {
        const token = sessionStorage.getItem('token');
        const respuesta = await fetch('/reviews/mis-resenas', {
            headers: { 'Authorization': token }
        });

        if (respuesta.ok) {
            const reseñasBackend = await respuesta.json();

           const llaveTMDB = (typeof ENV !== 'undefined' && ENV.TMDB_API_KEY) ? ENV.TMDB_API_KEY : 'TU_LLAVE_AQUI';

            
            misResenas = await Promise.all(reseñasBackend.map(async (resena) => {
                try {
                    const peticionTMDB = await fetch(`https://api.themoviedb.org/3/movie/${resena.movieId}?api_key=${llaveTMDB}&language=es-MX`);
                    const datosPelicula = await peticionTMDB.json();
                    
                    
                    resena.posterPath = datosPelicula.poster_path; 
                } catch (errorTMDB) {
                    console.error("No se pudo obtener el póster de TMDB para:", resena.movieTitle);
                }
                return resena; 
            }));

        } else {
            console.error("Error al cargar reseñas para el calendario");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

function renderizarCalendario() {
    const grid = document.getElementById('calendar-grid');
    const displayMes = document.getElementById('month-year-display');
    grid.innerHTML = ''; // Limpiamos la cuadrícula

    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    // Actualizamos el titulo
    displayMes.textContent = `${meses[mes]} ${año}`;

    // getDay() devuelve 0(Dom) a 6(Sab). Convertimos para que Lunes sea el primer día.
    let primerDiaSemana = new Date(año, mes, 1).getDay(); 
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1; 

    const diasEnMes = new Date(año, mes + 1, 0).getDate();

    // Dibujar espacios vacíos antes del día 1
    for (let i = 0; i < primerDiaSemana; i++) {
        grid.innerHTML += `<div class="calendar-cell empty"></div>`;
    }

    //Dibujar los días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
        
        const mesString = String(mes + 1).padStart(2, '0');
        const diaString = String(dia).padStart(2, '0');
        const fechaCelda = `${año}-${mesString}-${diaString}`;

        const peliculasDelDia = misResenas.filter(resena => {
            const fechaResena = resena.watchedAt ? new Date(resena.watchedAt) : new Date(resena.createdAt);
            return fechaResena.toISOString().split('T')[0] === fechaCelda;
        });

        let contenidoDia = `<span class="day-number">${dia}</span>`;

        if (peliculasDelDia.length > 0) {
            
            // Dia arriba del poster
            contenidoDia = `<span class="day-number position-absolute top-0 start-0 m-1" style="z-index: 10; text-shadow: 1px 1px 4px rgba(0,0,0,0.9); font-weight: bold;">${dia}</span>`;

            const badgeHTML = peliculasDelDia.length > 1 
                ? `<div class="badge bg-danger position-absolute top-0 end-0 m-1 rounded-circle shadow" style="z-index: 10;">${peliculasDelDia.length}</div>` 
                : '';

            let sliderHTML = `<div class="posters-slider d-flex w-100 h-100" style="overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; flex-wrap: nowrap; scrollbar-width: none;">`;
            
            peliculasDelDia.forEach(pelicula => {
                
                sliderHTML += `
                    <a href="review.html?id=${pelicula.movieId}" style="display: block; flex: 0 0 100%; height: 100%; scroll-snap-align: start; text-decoration: none;">
                        <img src="${pelicula.posterPath ? 'https://image.tmdb.org/t/p/w200' + pelicula.posterPath : 'https://via.placeholder.com/200x300/1a1a1a/ffffff?text=Sin+Póster'}" 
                             class="w-100 h-100" 
                             style="object-fit: cover; border-radius: 4px;" 
                             alt="${pelicula.movieTitle}">
                    </a>
                `;
            });
            sliderHTML += `</div>`;

            grid.innerHTML += `
                <div class="calendar-cell has-movie position-relative p-0" style="overflow: hidden;">
                    ${contenidoDia}
                    ${badgeHTML}
                    ${sliderHTML}
                </div>
            `;
        } else {
            
            grid.innerHTML += `<div class="calendar-cell p-1">${contenidoDia}</div>`;
        }
    }
    iniciarAutoSlider(); 
    actualizarResumenMes();
}


function configurarBotonesMes() {
    document.getElementById('prev-month').addEventListener('click', () => {
        fechaActual.setMonth(fechaActual.getMonth() - 1);
        renderizarCalendario();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        fechaActual.setMonth(fechaActual.getMonth() + 1);
        renderizarCalendario();
    });
}


function iniciarAutoSlider() {
    // Limpiamos cualquier cronómetro anterior
    if (intervaloSlider) clearInterval(intervaloSlider);

    // Iniciamos el nuevo cronómetro cada 6 segundos
    intervaloSlider = setInterval(() => {
        // Buscamos todas las celdas que tengan el slider
        const sliders = document.querySelectorAll('.posters-slider');
        
        sliders.forEach(slider => {
            if (slider.scrollWidth > slider.clientWidth) {
                
                // Eedondeamos y evitar problemas de decimales
                const currentScroll = Math.ceil(slider.scrollLeft); 
                const maxScroll = slider.scrollWidth - slider.clientWidth;

                // Si  ya estamos en el tope derecho 
                if (currentScroll >= maxScroll - 5) { 
                    // Regresamos al inicio (primer póster)
                    slider.scrollTo({
                        left: 0,
                        behavior: 'smooth'
                    });
                } else {
                    // Si no, simplemente avanzamos al siguiente póster
                    slider.scrollTo({
                        left: currentScroll + slider.clientWidth,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }, 4000);
}

function actualizarResumenMes() {

    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth(); // Enero es 0, Diciembre es 11

    // 2. Filtramos solo las reseñas que pertenecen a ese mes y año
    const resenasDelMes = misResenas.filter(resena => {
        const fecha = resena.watchedAt ? new Date(resena.watchedAt) : new Date(resena.createdAt);
        return fecha.getFullYear() === año && fecha.getMonth() === mes;
    });

    const totalPeliculas = resenasDelMes.length;


    let promedio = 0;
    if (totalPeliculas > 0) {
        const sumaCalificaciones = resenasDelMes.reduce((suma, resena) => suma + (resena.rating || 0), 0);
        promedio = (sumaCalificaciones / totalPeliculas).toFixed(1); // toFixed(1) deja un solo decimal
    }

    const obrasMaestras = resenasDelMes.filter(resena => resena.rating === 5).length;

    document.getElementById('resumen-total').textContent = totalPeliculas;
    document.getElementById('resumen-promedio').textContent = totalPeliculas > 0 ? promedio : '-';
    document.getElementById('resumen-obras').textContent = obrasMaestras;
}