
const API_KEY = ENV.TMDB_API_KEY;
const BASE_URL = ENV.TMDB_BASE_URL;
const IMG_URL = ENV.TMDB_IMG_URL;

const genreMap = {
    "accion": 28,
    "aventura": 12,
    "animacion": 16,
    "comedia": 35,
    "crimen": 80,
    "documental": 99,
    "drama": 18,
    "familia": 10751,
    "fantasia": 14,
    "historia": 36,
    "terror": 27,
    "musica": 10402,
    "misterio": 9648,
    "romance": 10749,
    "ciencia ficcion": 878,
    "tv": 10770,
    "thriller": 53,
    "guerra": 10752,
    "western": 37
};


async function loadPopularMovies() {
    try {
        const res = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-MX&page=1`
        );
        const data = await res.json();

        renderMovies(data.results, "popularMoviesContainer");

    } catch (err) {
        console.error("Error populares:", err);
    }
}

async function loadRatedMovies() {
    try {
        const res = await fetch(
            `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-MX&page=1`
        );
        const data = await res.json();

        renderMovies(data.results, "ratedMoviesContainer");

    } catch (err) {
        console.error("Error top rated:", err);
    }
}


function loadMoviesByGenre(genreId) {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=es-MX`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderMovies(data.results, "filteredMoviesContainer"); 
        });
}

function loadMoviesByGenreDefault() {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&language=es-MX`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderMovies(data.results, "filteredMoviesContainer"); 
        });
}


function renderMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieBox = document.createElement("div");
        movieBox.classList.add("movieBox");

        movieBox.innerHTML = `
            <div class="movieWrapper">
                <img 
                    class="poster"
                    src="${IMG_URL}${movie.poster_path}"
                    alt="${movie.title}"
                >
                <div class="overlay">
                    <div class="movieTitle">${movie.title}</div>
                    <div class="movieYear">(${movie.release_date ? movie.release_date.split("-")[0] : ""})</div>
                    <button class="addBtn">+</button>
                </div>
            </div>
        `;

        movieBox.addEventListener("click", () => {
            window.location.href = `review.html?id=${movie.id}`;
        });

        const addBtn = movieBox.querySelector(".addBtn");

        addBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 

            selectedMovie = movie;

            const modal = new bootstrap.Modal(
                document.getElementById("modalAgregarPelicula")
            );
            modal.show();

            cargarListasEnModal();
        });

        container.appendChild(movieBox);
    });
}


function scrollMovies(direction) {
    const container = document.getElementById("popularMoviesContainer");

    container.scrollBy({
        left: direction * 300,
        behavior: "smooth"
    });
}

function setupTags() {
    const tags = document.querySelectorAll(".tag-icon");

    tags.forEach(tag => {
        tag.addEventListener("click", () => {

            tags.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");

            const genreId = tag.getAttribute("data-id");

            if (genreId === "all") {
                loadPopularMovies(); 
            } else {
                loadMoviesByGenre(genreId);
            }
        });
    });
}

async function cargarListasEnModal() {
    console.log("Cargando listas en modal...");

    const res = await fetch("http://localhost:3000/lists", {
        headers: {
            Authorization: sessionStorage.getItem("token")
        }
    });

    const listas = await res.json();

    console.log("Listas:", listas);

    if (!Array.isArray(listas)) {
        console.error("Error:", listas);
        return;
    }

    const container = document.getElementById("listasModalContainer");
    container.innerHTML = "";

    listas.forEach(lista => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-light w-100 mb-2";
        btn.textContent = lista.nombre;

        btn.addEventListener("click", () => agregarAPelicula(lista.id));

        container.appendChild(btn);
    });
}

async function agregarAPelicula(listId) {
    console.log("Agregando a lista:", listId);
    console.log("Película:", selectedMovie);

    await fetch(`http://localhost:3000/lists/${listId}/movies`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("token")
    },
    body: JSON.stringify({
        tmdbId: selectedMovie.id,
        titulo: selectedMovie.title,
        poster_path: selectedMovie.poster_path,
        año: selectedMovie.release_date 
            ? selectedMovie.release_date.split("-")[0] 
            : ""
    })
});

    console.log("POST enviado");

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalAgregarPelicula"));
    modal.hide();

    cargarListas();
}

const input = document.getElementById("customGenreInput");

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const value = input.value.toLowerCase().trim();

        const genreId = genreMap[value];

        if (genreId) {
            loadMoviesByGenre(genreId);
        } else {
            loadMoviesByGenreDefault();
        }
    }
});


document.addEventListener("DOMContentLoaded", () => {
    loadPopularMovies();
    loadRatedMovies();
    loadMoviesByGenreDefault();
    setupTags();
});