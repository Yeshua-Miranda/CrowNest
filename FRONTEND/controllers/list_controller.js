async function cargarListas() {
    const res = await fetch("http://localhost:3000/lists?userId=1");
    const listas = await res.json();

    renderListas(listas);
}
function renderListas(listas) {
    const container = document.querySelector(".listasContainer");
    container.innerHTML = "";

    listas.forEach((lista, index) => {
        const card = document.createElement("div");
        card.className = "listaCard";

        if (index === 0) {
            card.classList.add("listaCard--activa");
            renderPeliculas(lista);
        }

        card.innerHTML = `
            <h5 class="listaCard__titulo">${lista.nombre}</h5>
            <p class="listaCard__count">${lista.peliculas.length} películas</p>
        `;

        // click para cambiar de lista
        card.addEventListener("click", () => {
            document.querySelectorAll(".listaCard")
                .forEach(c => c.classList.remove("listaCard--activa"));

            card.classList.add("listaCard--activa");
            renderPeliculas(lista);
        });

        container.appendChild(card);
    });
}
function renderPeliculas(lista) {
    const grid = document.getElementById("moviesListContainer");
    grid.innerHTML = "";

    if (!lista.peliculas || lista.peliculas.length === 0) {
        grid.innerHTML = "<p>No hay películas en esta lista</p>";
        return;
    }

    lista.peliculas.forEach(peli => {
        const div = document.createElement("div");
        div.className = "movieBox";

        div.innerHTML = `
            <img 
                class="poster" 
                src="https://image.tmdb.org/t/p/w500${peli.poster_path}"
                alt="${peli.titulo}"
            >
        `;

        div.addEventListener("click", () => {
            window.location.href = `review.html?id=${peli.tmdbId}`;
        });

        grid.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Cargando listas...");
    cargarListas();
});