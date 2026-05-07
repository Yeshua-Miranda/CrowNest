
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

async function buscarPeliculas(query) {
    try {
        const res = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=es-MX`
        );

        const data = await res.json();

        return data.results;

    } catch (err) {
        console.error("Error buscando:", err);
        return [];
    }
}



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

async function loadUserRatedMovies() {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:3000/reviews/mis-resenas", {
            headers: { Authorization: token }
        });

        const reviews = await res.json();
        if (!Array.isArray(reviews)) return;

        const unique = Object.values(
            reviews.reduce((acc, review) => {
                if (!acc[review.movieId]) acc[review.movieId] = review;
                return acc;
            }, {})
        );

        const container = document.getElementById("ratedByUserContainer");
        container.innerHTML = "";

        if (reviews.length === 0) {
            container.innerHTML = `<p style="color:gray; padding: 1rem;">Aún no has calificado ninguna película.</p>`;
            return;
        }

        unique.forEach(review => {
            const posterSrc = review.moviePoster
                ? `${IMG_URL}${review.moviePoster}`
                : `${IMG_URL}/w500${review.moviePoster}`;

            const estrellas = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

            const movieBox = document.createElement("div");
            movieBox.classList.add("movieBox");

            movieBox.innerHTML = `
                <div class="movieWrapper">
                    <img 
                        class="poster"
                        src="${posterSrc}"
                        alt="${review.movieTitle}"
                        onerror="this.src='../assets/img/no-poster.png'"
                    >
                    <div class="overlay">
                        <div class="movieTitle">${review.movieTitle}</div>
                        <div class="movieYear" style="color: gold;">${estrellas}</div>
                    </div>
                </div>
            `;

            movieBox.addEventListener("click", () => {
                window.location.href = `review.html?id=${review.movieId}`;
            });

            container.appendChild(movieBox);
        });

    } catch (err) {
        console.error("Error cargando reseñas del usuario:", err);
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

function renderResultadosBusqueda(peliculas) {
    const container = document.getElementById("searchResults");
    container.innerHTML = "";

    if (!peliculas || peliculas.length === 0) {
        container.classList.display = "none";
        return;
    }

    container.classList.add("show");
    container.style.opacity = "1";
    container.style.pointerEvents = "auto";
    container.style.display = "block";

    peliculas.slice(0, 8).forEach(peli => {
        const div = document.createElement("div");
        div.classList.add("searchItem");

        const poster = peli.poster_path
            ? `https://image.tmdb.org/t/p/w92${peli.poster_path}`
            : "../assets/img/no-poster.png";

        div.innerHTML = `
            <img src="${poster}">
            <span>
                <strong>${peli.title}</strong><br>
                <small>${peli.release_date?.split("-")[0] || "Año desconocido"}</small>
            </span>
        `;

        div.addEventListener("click", () => {
            window.location.href = `review.html?id=${peli.id}`;
        });

        container.appendChild(div);

        
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


const inputGenre = document.getElementById("customGenreInput");

if(inputGenre) {
    inputGenre.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const value = inputGenre.value.toLowerCase().trim();

        const genreId = genreMap[value];

        if (genreId) {
            loadMoviesByGenre(genreId);
        } else {
            loadMoviesByGenreDefault();
        }
    }
});
}



document.addEventListener("click", (e) => {
    const container = document.getElementById("searchResults");
    if (!container) return;

    if (!e.target.closest(".searchWrapper")) {
        container.style.display = "none";
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("searchForm");
    const inputGenre = document.getElementById("customGenreInput");
    const searchInput = document.getElementById("searchInput");

    

    if (form && searchInput) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        const query = searchInput.value.trim();

        if (query.length < 2) {
            document.getElementById("searchResults").innerHTML = "";
            return;
        }
        if (!query) return;

        const pelis = await buscarConFallback(query);

        if (pelis.length > 0 && pelis[0].id) {
            window.location.href = `review.html?id=${pelis[0].id}`;
        } else {
            console.warn("No se encontró película válida");
        }
    });
}

    if (inputGenre) {
        inputGenre.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const value = inputGenre.value.toLowerCase().trim();

                const genreId = genreMap[value];

                if (genreId) {
                    loadMoviesByGenre(genreId);
                } else {
                    loadMoviesByGenreDefault();
                }
            }
        });
    }

    if (searchInput) {
        let timeout;

        searchInput.addEventListener("input", () => {
        clearTimeout(timeout);

        timeout = setTimeout(async () => {
            const query = searchInput.value.trim();

            if (query.length < 2) {
                document.getElementById("searchResults").innerHTML = "";
                return;
            }

            const pelis = await buscarPeliculas(query);
            renderResultadosBusqueda(pelis);

        }, 300);
    }); 
    }
    loadPopularMovies();
    loadRatedMovies();
    loadMoviesByGenreDefault();
    setupTags();
    loadUserRatedMovies();

});


    
     
