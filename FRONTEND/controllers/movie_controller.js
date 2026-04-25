
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
            <img 
                class="poster"
                src="${IMG_URL}${movie.poster_path}"
                alt="${movie.title}"
            >
        `;

        movieBox.addEventListener("click", () => {
            window.location.href = `review.html?id=${movie.id}`;
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