const IMG_URL = ENV.TMDB_IMG_URL;

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
                    <img class="poster" src="${IMG_URL}${peli.poster_path}" alt="${peli.titulo}">
                </a>
            `;
            container.appendChild(box);
        });

    } catch (err) {
        console.error("Error cargando favoritos:", err);
    }
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

        const container = document.querySelector(".pestaña:last-child");
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
                    <img class="poster" src="${IMG_URL}${review.moviePoster}" alt="${review.movieTitle}">
                </a>
            `;
            grid.appendChild(box);
        });

    } catch (err) {
        console.error("Error cargando actividad reciente:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarFavoritos();
    cargarResenasProfile();
    cargarActividadReciente();
});