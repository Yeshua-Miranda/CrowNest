// navbar_controller.js

function renderNavbar() {
    const nav = document.getElementById("navbar");
    nav.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div class="container">
                <a class="navbar-brand fw-bold" href="home.html">
                    <img 
                        src="../assets/img/logo.png" 
                        alt="Logo" 
                        width="45" height="45" 
                        class="rounded-circle border border-2 border-secondary"
                    >
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarPrincipal">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarPrincipal">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item"><a class="nav-link" href="home.html">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="movie.html">Movies</a></li>
                        <li class="nav-item"><a class="nav-link" href="calendar.html">Calendar</a></li>
                    </ul>

                    <form class="d-flex align-items-center" id="searchForm" method="GET">
                        <div class="searchWrapper">
                            <input 
                                class="form-control me-3" 
                                id="searchInput"
                                type="search" 
                                placeholder="Search"
                            >
                            <div id="searchResults" class="searchResults"></div>
                        </div>
                        <button class="btn btn-outline-light me-4" type="submit">Buscar</button>

                        <a href="profile.html" class="d-block" title="Ir a mi perfil">
                            <img 
                                id="navAvatar"
                                src="../assets/img/avatar.png" 
                                alt="Foto de perfil" 
                                width="45" height="45" 
                                class="rounded-circle border border-2 border-secondary"
                            >
                        </a>
                        <button class="btn" type="button" style="cursor:pointer; color:white;" onclick="logout()">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    `;

    marcarNavActivo();
    setupNavbarSearch();
}

// Marca el link activo según la página actual
function marcarNavActivo() {
    const page = window.location.pathname.split("/").pop();
    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === page) {
            link.classList.add("active");
        }
    });
}

// Lógica de búsqueda
function setupNavbarSearch() {
    const form = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (form && searchInput) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query.length < 2) return;

            const pelis = await buscarConFallback(query);
            if (pelis.length > 0 && pelis[0].id) {
                window.location.href = `review.html?id=${pelis[0].id}`;
            }
        });

        let timeout;
        searchInput.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const query = searchInput.value.trim();
                if (query.length < 2) {
                    document.getElementById("searchResults").style.display = "none";
                    return;
                }
                const pelis = await buscarPeliculas(query);
                renderResultadosBusqueda(pelis);
            }, 300);
        });
    }

    document.addEventListener("click", (e) => {
        const container = document.getElementById("searchResults");
        if (container && !e.target.closest(".searchWrapper")) {
            container.style.display = "none";
        }
    });
}

// agrega estas dos funciones en navbar_controller.js

async function buscarPeliculas(query) {
    try {
        const res = await fetch(
            `${ENV.TMDB_BASE_URL}/search/movie?api_key=${ENV.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-MX`
        );
        const data = await res.json();
        return data.results;
    } catch (err) {
        console.error("Error buscando:", err);
        return [];
    }
}

function renderResultadosBusqueda(peliculas) {
    const container = document.getElementById("searchResults");
    if (!container) return;
    container.innerHTML = "";

    if (!peliculas || peliculas.length === 0) {
        container.style.display = "none";
        return;
    }

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

document.addEventListener("DOMContentLoaded", renderNavbar);