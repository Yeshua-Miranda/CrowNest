const API_KEY = ENV.TMDB_API_KEY;
const BASE_URL = ENV.TMDB_BASE_URL;
const IMG_URL = ENV.TMDB_IMG_URL;

let peliculaActualTMDB = null; 
let esFavorita = false;
let listaFavoritosId = null;

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

async function loadMovieDetails() {
    if (!movieId) return;

    try {
        const [detailRes, recomRes] = await Promise.all([ //hacemos un array de promesas para el promise.all :V
            fetch(BASE_URL + "/movie/" + movieId + "?api_key=" + API_KEY + "&language=es-MX"),
            fetch(BASE_URL + "/movie/" + movieId + "/recommendations?api_key=" + API_KEY + "&language=es-MX")
        ]);

        const movie = await detailRes.json();
        const recom = await recomRes.json();

        peliculaActualTMDB = movie;

        await verificarEstadoFavorito(movieId);

        renderMovieDetails(movie);
        renderRecommendations(recom.results);

    } catch (err) {
        console.error("Error cargando película:", err);
    }
}

function renderMovieDetails(movie) {
    const posterEl = document.querySelector(".movie"); //si existe el elemento y la peli tiene poster lo asignamos.
    if (posterEl && movie.poster_path) {
        posterEl.src = IMG_URL + movie.poster_path;
        posterEl.alt = movie.title;
    }

    const titleEl = document.getElementById("movie_title");
    if (titleEl) titleEl.textContent = movie.title; //si existe el elemento le asignamos el titulo de la peli

    const sinopsisEl = document.getElementById("sinopsis");
    if (sinopsisEl) sinopsisEl.textContent = movie.overview || "Sin sinopsis disponible."; //lo mismo con sinopsis

    const tagsEl = document.querySelector(".tags");
    if (tagsEl && movie.genres) {
        tagsEl.innerHTML = movie.genres
            .map(g => "<span class=\"tag-icon\">" + g.name + "</span>") //map para convertir cada genero en un span con clase tag-icon y el nombre del gener
            .join("");
    }

    document.title = movie.title;
}

function renderRecommendations(movies) {
    const container = document.querySelector(".recommendations");
    if (!container) return; //si no existe el contenedor de recomendaciones, no hacemos nada

    container.innerHTML = "";

    movies.slice(0, 6).forEach(movie => {
        if (!movie.poster_path) return;

        const box = document.createElement("div");
        box.classList.add("movieBox");
        box.innerHTML = "<img class=\"poster\" src=\"" + IMG_URL + movie.poster_path + "\" alt=\"" + movie.title + "\">";

        box.addEventListener("click", () => {
            window.location.href = "review.html?id=" + movie.id;
        });

        container.appendChild(box);
    });
}

document.addEventListener("DOMContentLoaded", loadMovieDetails);

let idResenaEnEdicion = null; // Variable para saber si estamos editando

// Esta función se dispara al darle clic al botón "Editar" de tu tarjeta
window.prepararEdicion = function(id, texto, rating) {
    idResenaEnEdicion = id; 
    
    // Llenamos la caja de texto
    document.getElementById('reviewTextInput').value = texto;
    
    
    const stars = document.querySelectorAll('#rating-review .fa-star');
    if(stars[rating - 1]) stars[rating - 1].click();

    // Cambiamos el texto de tu botón principal
    const btnSubmit = document.getElementById('btnSubmitReview');
    btnSubmit.innerHTML = 'Actualizar Reseña';
    
    window.scrollTo({ top: document.getElementById('movie_title').offsetTop, behavior: 'smooth' });
};

document.addEventListener("DOMContentLoaded", () => {
    
    loadMovieDetails();
    fetchMovieReviews();
    setupFilters();
   
    const stars = document.querySelectorAll('#rating-review .fa-star');
    
    let calificacionSeleccionada = 3; 
    
   const hoy = new Date();
   const añoLocal = hoy.getFullYear();
   const mesLocal = String(hoy.getMonth() + 1).padStart(2, '0');
   const diaLocal = String(hoy.getDate()).padStart(2, '0');

    // Ponemos el formato
    document.getElementById('watchedAtInput').value = `${añoLocal}-${mesLocal}-${diaLocal}`;

    stars.forEach((star, index) => {
        star.style.cursor = 'pointer'; 
        star.addEventListener('click', () => {
            calificacionSeleccionada = index + 1; 
            stars.forEach((s, i) => {
                if (i < calificacionSeleccionada) {
                    s.classList.add('checked');
                } else {
                    s.classList.remove('checked');
                }
            });
        });
    });

    
    const btnSubmit = document.getElementById('btnSubmitReview');

    if (btnSubmit) {
        btnSubmit.addEventListener('click', async (evento) => {
            evento.preventDefault(); 

            // Extraemos texto y validamos token
            const reviewText = document.getElementById('reviewTextInput').value;
            const movieTitle = document.getElementById('movie_title').textContent; 
            const token = sessionStorage.getItem('token'); 
            const isWatchedValue = document.getElementById('isWatchedInput').checked;
            const watchedAtValue = document.getElementById('watchedAtInput').value;

            
            if (isWatchedValue && !watchedAtValue) {
                alert("Debes indicar cuándo viste la película.");
                return;
            }

            if (!token) {
                alert("Acceso denegado: Por favor inicia sesión para publicar.");
                window.location.href = "login.html"; 
                return;
            }

            if (reviewText.trim() === '') {
                alert("No puedes publicar una reseña vacía");
                return;
            }

            const metodoFetch = idResenaEnEdicion ? 'PUT' : 'POST';
            const urlFetch = idResenaEnEdicion ? `/reviews/editar/${idResenaEnEdicion}` : '/reviews/crear';

            try {
              
                const respuesta = await fetch('http://localhost:3000' + urlFetch, {
                    method: metodoFetch,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': sessionStorage.token
                    },
                    body: JSON.stringify({
                        movieId: movieId, 
                        movieTitle: movieTitle,
                        moviePoster: document.querySelector(".movie")?.src?.replace(IMG_URL, "") || "",
                        rating: calificacionSeleccionada,
                        reviewText: reviewText,
                        isWatched: isWatchedValue,
                        watchedAt: watchedAtValue
                    })
                });

                const datos = await respuesta.json();

                if (respuesta.ok) { 
                    document.getElementById('reviewTextInput').value = ''; 

                    idResenaEnEdicion = null;
                    document.getElementById('btnSubmitReview').innerHTML = 'Publicar Reseña';

                    fetchMovieReviews(1, 'Todas'); // otra ves reseña
                    
                    alert("Reseña publicada con éxito");
                    
                } else {
                    alert("Hubo un error al guardar: " + datos.msg);
                }

            } catch (error) {
                console.error("Error en el servidor:", error);
                alert("No se pudo conectar con el servidor backend.");
            }
        });
    }
});

// Seccion de las reseñas, filtros y paginacion

let currentPage = 1;
let currentRating = 'Todas';

async function fetchMovieReviews(page = 1, rating = 'Todas') {
    if (!movieId) return;

    try {
        let url = `/reviews/pelicula/${movieId}?page=${page}&limit=5`;

        if (rating === 'Mias') {
            const userStorage = sessionStorage.getItem('user');
            if (userStorage && userStorage !== "undefined") {
                const user = JSON.parse(userStorage);
                
                const idAutor = user._id || user.id; 
                
                if (idAutor) {
                    url += `&autor=${idAutor}`; 
                } else {
                    console.error("No se encontró el ID del usuario en la sesión.");
                }
            }
        } else if( rating === 'Amigos') {
            const userStorage = sessionStorage.getItem('user');
            if (userStorage && userStorage !== "undefined") {
                const user = JSON.parse(userStorage);
                const idUsuario = user._id || user.id;

                if (idUsuario) {
                    url += `&rating=Amigos&autor=${idUsuario}`; 
                } else {
                    alert("No se encontró el ID del usuario en la sesión.");
                }
            }

        } else if (rating !== 'Todas') {
            url += `&rating=${rating}`;
        }

        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            renderReviews(data.reviews);
            
            renderPagination(data.totalPages, data.currentPage);
        } else {
            console.error("Error al cargar reseñas");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('reviews');
    container.innerHTML = ''; // Limpiamos la pantalla

    
    if (reviews.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; margin-top: 20px;">No hay reseñas con estos filtros. ¡Sé el primero en opinar!</p>';
        return;
    }

    // Sacamos al usuario
    const currentUser = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;

    reviews.forEach(review => {
        
        const estrellasLlenas = '★'.repeat(review.rating);
        const estrellasVacias = '☆'.repeat(5 - review.rating);
        const estrellasVisuales = estrellasLlenas + estrellasVacias;

        
        const userName = (review.userId && review.userId.name) ? review.userId.name : "Usuario";

        const miId = currentUser ? (currentUser._id || currentUser.id) : null;
        const autorId = review.userId ? (review.userId._id || review.userId) : null;
        const isMine = miId && autorId && (miId.toString() === autorId.toString());

        // Foto de avatar

        const otherUser = getOtherUser(review.userId._id || review.userId);

        const numeroFoto = (review.userId && review.userId.profile_photo) ? review.userId.profile_photo : 1;
        
        const avatarUrl = `../assets/profiles/${numeroFoto}.jpg`;
        
        const fechaFormateada = new Date(review.createdAt).toLocaleDateString('es-MX');

        const enlacePerfil = autorId 
                ? `<a href="profile.html?id=${autorId}" style="color: white; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${userName}</a>` 
                : userName;

        const botonesAccion = isMine ? 
            `<div class="mt-2">
                <button class="btn btn-sm btn-outline-warning me-2" onclick="prepararEdicion('${review._id}', '${review.reviewText}', ${review.rating})">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarResena('${review._id}')">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </div>` : '';

        const reviewHTML = `
            <div class="review" data-rating="${review.rating}">
                <img src="${avatarUrl}" class="avatar" alt="Avatar">
                <div class="review-content">
                    <h5 class="review-name">${enlacePerfil} <span style="font-size: 0.8em; color: gray; margin-left: 10px;">${fechaFormateada}</span></h5>
                    <div class="stars">${estrellasVisuales} <span style="color: white; font-weight: bold;"> ${review.rating}.0 </span></div>
                    <p style="margin-top: 5px;">${review.reviewText}</p>
                    ${botonesAccion}
                </div>
            </div>
        `;
        
        container.innerHTML += reviewHTML; 
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Quitamos el diseño "activo" de todos y se lo ponemos al que le dimos clic
            filterButtons.forEach(b => b.style.opacity = '0.5'); 
            e.target.style.opacity = '1';

            // Sacamos el valor de la etiqueta oculta (ej. "5", "Todas")
            currentRating = e.target.getAttribute('data-rating');
            currentPage = 1; // Regresamos a la página 1
            
            // Vamos de nuevo al backend con el nuevo filtro
            fetchMovieReviews(currentPage, currentRating);
        });
    });
}

// Función para dibujar los botones de paginación
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';

    // Si solo hay 1 página (o ninguna), no dibujamos botones
    if (totalPages <= 1) return; 

    // Boton anterior
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('boton-review');
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Anterior';
    
    if (currentPage === 1) {
        prevBtn.style.opacity = '0.3'; 
        prevBtn.style.cursor = 'not-allowed';
        prevBtn.disabled = true;
    } else {
        prevBtn.addEventListener('click', () => {
            currentPage--;
            fetchMovieReviews(currentPage, currentRating);
        });
    }
    paginationContainer.appendChild(prevBtn);

    // Números de página
    
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('boton-review');
        pageBtn.innerText = i;

        if (i === currentPage) {
            
            pageBtn.style.border = '2px solid white';
            pageBtn.style.fontWeight = 'bold';
            pageBtn.style.opacity = '1';
        } else {
           
            pageBtn.style.opacity = '0.6'; 
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                fetchMovieReviews(currentPage, currentRating);
            });
        }
        paginationContainer.appendChild(pageBtn);
    }

    // Boton Siguiente
    
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('boton-review');
    nextBtn.innerHTML = 'Siguiente <i class="fa-solid fa-chevron-right"></i>';

    if (currentPage === totalPages) {
        nextBtn.style.opacity = '0.3'; 
        nextBtn.style.cursor = 'not-allowed';
        nextBtn.disabled = true;
    } else {
        nextBtn.addEventListener('click', () => {
            currentPage++;
            fetchMovieReviews(currentPage, currentRating);
        });
    }
    paginationContainer.appendChild(nextBtn);
}

window.eliminarResena = async function(idResena) {
    
    if (!confirm("¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.")) {
        return; 
    }

    try {
        
        const token = sessionStorage.getItem('token');
        
        const respuesta = await fetch(`/reviews/borrar/${idResena}`, { 
            method: 'DELETE',
            headers: {
                'Authorization': token
            }
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert("¡Reseña eliminada correctamente!");
            
            fetchMovieReviews(currentPage, currentRating);
        } else {
            alert("Error al eliminar: " + datos.msg);
        }
    } catch (error) {
        console.error("Error de conexión al eliminar:", error);
        alert("No se pudo conectar con el servidor.");
    }
};


async function verificarEstadoFavorito(idPelicula) {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
        const respuestaListas = await fetch('http://localhost:3000/lists', {
            headers: { 'Authorization': token }
        });
        
        if (!respuestaListas.ok) return;

        const listas = await respuestaListas.json();
        const listaDestino = listas.find(lista => lista.isDefault === true || lista.nombre === 'Favoritos');

        if (listaDestino) {
            listaFavoritosId = listaDestino.id; // Guardamos el ID de la lista para usarlo al dar clic
            
            // Buscamos si el ID de TMDB ya existe dentro del arreglo de películas de esa lista
            const peliEncontrada = listaDestino.peliculas.find(p => p.tmdbId === parseInt(idPelicula));
            
            if (peliEncontrada) {
                esFavorita = true;
                actualizarBotonVisual(true);
            }
        }
    } catch (error) {
        console.error("Error verificando estado de favoritos:", error);
    }
}

function actualizarBotonVisual(activa) {
    const btn = document.getElementById('btn-favorito');
    if (!btn) return;

    if (activa) {
        btn.classList.remove('btn-outline-danger');
        btn.classList.add('btn-danger'); 
        btn.innerHTML = '<i class="fa-solid fa-heart"></i> En Favoritos';
    } else {
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-outline-danger'); 
        btn.innerHTML = '<i class="fa-regular fa-heart"></i> Agregar a Favoritos';
    }
}

window.toggleFavorito = async function() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert("Debes iniciar sesión para administrar favoritos.");
        return;
    }

    if (!listaFavoritosId) {
        alert("Aún no se ha cargado tu lista de Favoritos. Espera un segundo.");
        return;
    }

    const btn = document.getElementById('btn-favorito');
    const contenidoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
    btn.disabled = true;

    try {
        if (esFavorita) {
            // Delete
            const respuestaQuitar = await fetch(`http://localhost:3000/lists/${listaFavoritosId}/movies/${peliculaActualTMDB.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });

            if (respuestaQuitar.ok) {
                esFavorita = false;
                actualizarBotonVisual(false);
            } else {
                alert("Error al quitar de favoritos.");
                btn.innerHTML = contenidoOriginal;
            }
        } else {
            // Agregar
            const bodyPelicula = {
                tmdbId: peliculaActualTMDB.id,
                titulo: peliculaActualTMDB.title,
                poster_path: peliculaActualTMDB.poster_path,
                año: peliculaActualTMDB.release_date ? peliculaActualTMDB.release_date.split('-')[0] : "Desconocido"
            };

            const respuestaAgregar = await fetch(`http://localhost:3000/lists/${listaFavoritosId}/movies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(bodyPelicula)
            });

            if (respuestaAgregar.ok) {
                esFavorita = true;
                actualizarBotonVisual(true);
            } else {
                alert("Error al agregar a favoritos.");
                btn.innerHTML = contenidoOriginal;
            }
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Ocurrió un error en el servidor.");
        btn.innerHTML = contenidoOriginal;
    } finally {
        btn.disabled = false; 
    }
};