const API_KEY = ENV.TMDB_API_KEY;
const BASE_URL = ENV.TMDB_BASE_URL;
const IMG_URL = ENV.TMDB_IMG_URL;

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