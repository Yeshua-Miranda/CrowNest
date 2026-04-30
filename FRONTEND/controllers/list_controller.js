async function cargarListas() {
    const res = await fetch("http://localhost:3000/lists?userId=1");
    const listas = await res.json();
    let listaAEliminar = null;

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
            <div class="listaCard__header">
                <h5 class="listaCard__titulo">${lista.nombre}</h5>
                <button class="listaCard__deleteBtn" title="Eliminar lista">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <p class="listaCard__count">${lista.peliculas.length} películas</p>
        `;

        // click en la card para cambiar de lista
        card.addEventListener("click", () => {
            document.querySelectorAll(".listaCard")
                .forEach(c => c.classList.remove("listaCard--activa"));

            card.classList.add("listaCard--activa");
            renderPeliculas(lista);
        });

        // click en el botón de basura
        const deleteBtn = card.querySelector(".listaCard__deleteBtn");

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            listaAEliminar = lista.id;

            const modal = new bootstrap.Modal(
                document.getElementById("modalEliminarLista")
            );
            modal.show();
        });

        container.appendChild(card);
    });
}
function renderPeliculas(lista) {
    const grid = document.getElementById("moviesListContainer");
    grid.innerHTML = "";

    // 🔥 guardar lista actual
    listaActualId = lista.id;

    if (!lista.peliculas || lista.peliculas.length === 0) {
        grid.innerHTML = "<p style='color: white;'>No hay películas en esta lista</p>";
        return;
    }

    lista.peliculas.forEach(peli => {
        const div = document.createElement("div");
        div.className = "movieBox";

        div.innerHTML = `
            <div class="movieWrapper">
                <img 
                    class="poster"
                    src="${IMG_URL}${peli.poster_path}"
                    alt="${peli.titulo}"
                >
                <div class="overlay">
                    <div class="movieTitle">${peli.titulo}</div>
                    <button class="removeBtn">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // click para ir a review
        div.addEventListener("click", () => {
            window.location.href = `review.html?id=${peli.tmdbId}`;
        });

        // 🔥 BOTÓN BASURA AQUÍ
        const removeBtn = div.querySelector(".removeBtn");

        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            peliculaAEliminar = peli.tmdbId;

            const modal = new bootstrap.Modal(
                document.getElementById("modalEliminarPelicula")
            );
            modal.show();
        });

        grid.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Cargando listas...");
    cargarListas();
});

const btn = document.getElementById("crearListaBtn");

    if (btn) {
        btn.addEventListener("click", async () => {

            const nombre = document.getElementById("nombreLista").value;
            const descripcion = document.getElementById("descripcionLista").value;

            const visibilidad = document.querySelector('input[name="visibilidad"]:checked')?.value;

            if (!nombre || !visibilidad) {
                alert("Faltan campos");
                return;
            }

            try {
                const res = await fetch("http://localhost:3000/lists", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: 1,
                        nombre,
                        descripcion,
                        visibilidad
                    })
                });

                if (!res.ok) throw new Error("Error al crear lista");

                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("modalCrearLista")
                );
                modal.hide();

                document.getElementById("nombreLista").value = "";
                document.getElementById("descripcionLista").value = "";

                cargarListas();

            } catch (err) {
                console.error(err);
            }
        });
    }

let peliculaAEliminar = null;
let listaActualId = null;


document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {

    if (!peliculaAEliminar || !listaActualId) return;

    await fetch(`http://localhost:3000/lists/${listaActualId}/movies/${peliculaAEliminar}`, {
        method: "DELETE"
    });

    const modal = bootstrap.Modal.getInstance(
        document.getElementById("modalEliminarPelicula")
    );
    modal.hide();

    cargarListas(); 
});

document.getElementById("confirmDeleteListaBtn").addEventListener("click", async () => {
    if (!listaAEliminar) return;

    await fetch("http://localhost:3000/lists/" + listaAEliminar, {
        method: "DELETE"
    });

    const modal = bootstrap.Modal.getInstance(
        document.getElementById("modalEliminarLista")
    );
    modal.hide();

    listaAEliminar = null;
    cargarListas();
});