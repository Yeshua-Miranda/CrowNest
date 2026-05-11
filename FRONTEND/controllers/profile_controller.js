const PROFILE_IMG_URL = ENV.TMDB_IMG_URL; //PROFILE CONTROLLER

async function cargarFavoritos() {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    mostrarLoaderEl(document.querySelector(".recommendations"));

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

    mostrarLoader("reviews");

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
    mostrarLoader("listasPerfilContainer");
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

    // Extraemos el user
    const userStorage = sessionStorage.getItem("user");
    const user = userStorage ? JSON.parse(userStorage) : null;

    if (user && user.isGuest && !userId) {
        
        document.querySelector(".hero").style.display = "none";
        document.getElementById("page").style.display = "none";
        document.getElementById("friends-box-vis").style.display = "none";

        const mainArea = document.querySelector("main");
        mainArea.innerHTML = `
            <div style="text-align: center; margin-top: 100px; color: white;">
                <i class="fa-solid fa-user-secret" style="font-size: 4rem; color: gray; margin-bottom: 20px;"></i>
                <h2>Modo Invitado</h2>
                <p style="color: gray; margin-bottom: 20px;">Inicia sesión o regístrate para tener tu propio perfil, guardar favoritos y agregar amigos.</p>
                <button class="btn" style="background-color: #6f42c1; color: white; border: none; padding: 10px 20px; border-radius: 8px;" onclick="sessionStorage.clear(); window.location.href='../login.html'">Iniciar Sesión</button>
        `;
        return;
    }

    if (!userId) {
        // Perfil propio
        cargarFavoritos();
        cargarResenasProfile();
        cargarListasPerfil();
        cargarActividadReciente();
    } else {
        getPerfil(userId);
       
    }
}

function setupUserSearch() {
    const input = document.getElementById("userSearchInput");
    if (!input) return;

    let timeout;
    input.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            const q = input.value.trim();
            const container = document.getElementById("userSearchResults");

            if (q.length < 2) {
                container.style.display = "none";
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/users/search?q=${encodeURIComponent(q)}`);
                const users = await res.json();

                container.innerHTML = "";

                if (!users.length) {
                    container.style.display = "none";
                    return;
                }

                container.style.display = "block";

                users.forEach(user => {
                    const div = document.createElement("div");
                    div.classList.add("searchItem");

                    const foto = user.profile_photo
                        ? `../assets/profiles/${user.profile_photo}.jpg`
                        : "../assets/img/avatar.png";

                    div.innerHTML = `
                        <img src="${foto}">
                        <span>
                            <strong>${user.nick_name || user.name}</strong><br>
                            <small>${user.name}</small>
                        </span>
                    `;

                    div.addEventListener("click", () => {
                        window.location.href = `profile.html?userId=${user._id}`;
                    });

                    container.appendChild(div);
                });

            } catch (err) {
                console.error("Error buscando usuarios:", err);
            }
        }, 300);
    });


    input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const container = document.getElementById("userSearchResults");
        const first = container?.querySelector(".searchItem");
        if (first) first.click();
    }
});

    document.addEventListener("click", (e) => {
        const container = document.getElementById("userSearchResults");
        if (container && !e.target.closest(".searchWrapper")) {
            container.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarPerfil();
    setupUserSearch();
});