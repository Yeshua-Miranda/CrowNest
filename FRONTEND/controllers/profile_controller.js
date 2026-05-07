const PROFILE_IMG_URL = ENV.TMDB_IMG_URL; //PROFILE CONTROLLER

async function cargarFavoritos() {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:3000/lists", {
            headers: { Authorization: token }
        }); 
        const listas = await res.json();
        if (!Array.isArray(listas)) return;

        // Busca la lista default (Favoritos)
        const favoritos = listas.find(l => l.isDefault);
        if (!favoritos) return;

        const container = document.querySelector(".recommendations");
        container.innerHTML = "";

        if (favoritos.peliculas.length === 0) {
            container.innerHTML = "<p style='color:gray;'>Sin favoritos aún.</p>";
            return;
        }

        favoritos.peliculas.slice(0, 4).forEach(peli => {
            const box = document.createElement("div");
            box.className = "movieBox";
            box.innerHTML = `
                <a href="review.html?id=${peli.tmdbId}">
                    <img class="poster" src="${PROFILE_IMG_URL}${peli.poster_path}" alt="${peli.titulo}">
                </a>
            `;
            container.appendChild(box);
        });

    } catch (err) {
        console.error("Error cargando favoritos:", err);
    }
}

function renderPeliculasPerfil(lista) {
    const grid = document.getElementById("moviesListPerfilContainer");
    grid.innerHTML = "";

    if (!lista.peliculas || lista.peliculas.length === 0) {
        grid.innerHTML = "<p style='color:gray;'>No hay películas en esta lista.</p>";
        return;
    }

    lista.peliculas.forEach(peli => {
        const div = document.createElement("div");
        div.className = "movieBox";

        div.innerHTML = `
            <div class="movieWrapper">
                <img 
                    class="poster"
                    src="${PROFILE_IMG_URL}${peli.poster_path}"
                    alt="${peli.titulo}"
                >
                <div class="overlay">
                    <div class="movieTitle">${peli.titulo}</div>
                    <div class="movieYear">(${peli.año})</div>
                </div>
            </div>
        `;

        div.addEventListener("click", () => {
            window.location.href = `review.html?id=${peli.tmdbId}`;
        });

        grid.appendChild(div);
    });
}

console.log("profile_controller cargado");

async function cargarResenasProfile() {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:3000/reviews/mis-resenas", {
            headers: { Authorization: token }
        });
        const reviews = await res.json();
        if (!Array.isArray(reviews)) return;

        const container = document.getElementById("reviews");
        container.innerHTML = "";

        if (reviews.length === 0) {
            container.innerHTML = "<p style='color:gray;'>Sin reseñas aún.</p>";
            return;
        }

        reviews.slice(0, 3).forEach(review => {
            const estrellas = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
            container.innerHTML += `
                <div class="review" data-rating="${review.rating}">
                    <div class="review-content">
                        <h5 class="review-name">${review.movieTitle}</h5>
                        <div class="stars">${estrellas} <span style="color:white;"> ${review.rating}.0 </span></div>
                        <p>${review.reviewText}</p>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Error cargando reseñas:", err);
    }
}

async function cargarListasPerfil(userId = null) {
    const token = sessionStorage.getItem("token");

    const url = userId
        ? `http://localhost:3000/lists/user/${userId}`
        : `http://localhost:3000/lists`;

    const res = await fetch(url, {
        headers: token ? { Authorization: token } : {}
    });

    const listas = await res.json();
    if (!Array.isArray(listas)) return;

    const listasVisibles = userId
        ? listas.filter(l => !l.isDefault && l.visibilidad === "publica")
        : listas.filter(l => !l.isDefault);

    const container = document.getElementById("listasPerfilContainer");
    const grid = document.getElementById("moviesListPerfilContainer");

    if (!container || !grid) return;

    // limpiar contenido previo
    container.innerHTML = "";
    grid.innerHTML = "";

    if (listasVisibles.length === 0) {
        container.innerHTML =
            "<p style='color:gray;'>Sin listas aún.</p>";
        return;
    }

    listasVisibles.forEach((lista, index) => {

        const card = document.createElement("div");
        card.className = "listaCard";

        // renderizar primera lista automáticamente
        if (index === 0) {
            card.classList.add("listaCard--activa");
            renderPeliculasPerfil(lista);
        }

        card.innerHTML = `
            <h5 class="listaCard__titulo">${lista.nombre}</h5>

            <p class="listaCard__count">
                ${lista.peliculas.length} películas
            </p>

            <span class="badge ${
                lista.visibilidad === "publica"
                    ? "bg-success"
                    : "bg-secondary"
            } mt-1">

                ${lista.visibilidad}

            </span>
        `;

        card.addEventListener("click", () => {

            document
                .querySelectorAll(
                    "#listasPerfilContainer .listaCard"
                )
                .forEach(c =>
                    c.classList.remove("listaCard--activa")
                );

            card.classList.add("listaCard--activa");

            renderPeliculasPerfil(lista);
        });

        container.appendChild(card);
    });
}

async function cargarActividadReciente() {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:3000/reviews/mis-resenas", {
            headers: { Authorization: token }
        });
        const reviews = await res.json();
        if (!Array.isArray(reviews)) return;

        // Quita duplicados por movieId, queda la más reciente
        const unique = Object.values(
            reviews.reduce((acc, r) => {
                if (!acc[r.movieId]) acc[r.movieId] = r;
                return acc;
            }, {})
        );

        const container = document.querySelector(".pestaña:nth-child(3)");
        if (!container) return;
        const grid = document.createElement("div");
        grid.className = "recommendations";
        container.appendChild(grid);

        if (unique.length === 0) {
            grid.innerHTML = "<p style='color:gray;'>Sin actividad reciente.</p>";
            return;
        }

        unique.slice(0, 4).forEach(review => {
            if (!review.moviePoster) return;
            const box = document.createElement("div");
            box.className = "movieBox";
            box.innerHTML = `
                <a href="review.html?id=${review.movieId}">
                    <img class="poster" src="${PROFILE_IMG_URL}${review.moviePoster}" alt="${review.movieTitle}">
                </a>
            `;
            grid.appendChild(box);
        });

    } catch (err) {
        console.error("Error cargando actividad reciente:", err);
    }
}

async function cargarPerfil() {
    const token = sessionStorage.getItem("token");
    console.log("TOKEN:", token);
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    console.log("userId en URL:", userId);  


    if (!userId) {
        // Perfil propio
        cargarFavoritos();
        cargarResenasProfile();
        cargarListasPerfil();
        cargarActividadReciente();
    } else {
        // Perfil ajeno — solo listas públicas, sin endpoints privados
        getPerfil(userId);
       
    }
}

document.addEventListener("DOMContentLoaded", cargarPerfil);