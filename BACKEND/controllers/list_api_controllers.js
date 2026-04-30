const List = require('../models/list.js');

async function getLists(req, res) {
    try {
        const userId = parseInt(req.query.userId);

        if (!userId) {
            return res.status(400).json({ error: "userId es requerido" });
        }

        const lists = await List.find({ userId });
        res.json(lists);

    } catch (err) {
        console.error("Error getLists:", err);
        res.status(500).json({ error: "Error al obtener listas" });
    }
}

async function getListById(req, res) {
    try {
        const id = parseInt(req.params.id);

        const lista = await List.findOne({ id });

        if (!lista) {
            return res.status(404).json({ error: "Lista no encontrada" });
        }

        res.json(lista);

    } catch (err) {
        console.error("Error getListById:", err);
        res.status(500).json({ error: "Error al obtener la lista" });
    }
}

async function createList(req, res) {
    try {
        const { userId, nombre, descripcion, visibilidad } = req.body;

        if (!userId || !nombre || !visibilidad) {
            return res.status(400).json({ error: "userId, nombre y visibilidad son requeridos" });
        }

        const last = await List.findOne().sort({ id: -1 });
        const newId = last ? last.id + 1 : 1;

        const nueva = await List.create({
            id: newId,
            userId,
            nombre,
            descripcion,
            visibilidad,
            peliculas: []
        });

        res.status(201).json(nueva);

    } catch (err) {
        console.error("Error createList:", err);
        res.status(500).json({ error: "Error al crear la lista" });
    }
}

async function addMovie(req, res) {
    try {
        const listId = parseInt(req.params.id);
        const { tmdbId, titulo, poster_path, año } = req.body;

        if (!tmdbId || !titulo || !poster_path) {
            return res.status(400).json({ error: "tmdbId, titulo y poster_path son requeridos" });
        }

        const lista = await List.findOneAndUpdate(
            { id: listId },
            {
                $push: {
                    peliculas: {
                        tmdbId,
                        titulo,
                        poster_path,
                        año,
                        agregadaEn: new Date()
                    }
                },
                actualizadaEn: new Date()
            },
            { new: true }
        );

        if (!lista) {
            return res.status(404).json({ error: "Lista no encontrada" });
        }

        res.json(lista);

    } catch (err) {
        console.error("Error addMovie:", err);
        res.status(500).json({ error: "Error al agregar película" });
    }
}

async function removeMovie(req, res) {
    try {
        const listId = parseInt(req.params.id);
        const tmdbId = parseInt(req.params.tmdbId);

        const lista = await List.findOneAndUpdate(
            { id: listId },
            {
                $pull: { peliculas: { tmdbId } },
                actualizadaEn: new Date()
            },
            { new: true }
        );

        if (!lista) {
            return res.status(404).json({ error: "Lista no encontrada" });
        }

        res.json(lista);

    } catch (err) {
        console.error("Error removeMovie:", err);
        res.status(500).json({ error: "Error al quitar película" });
    }
}

async function deleteList(req, res) {
    try {
        const id = parseInt(req.params.id);

        const deleted = await List.findOneAndDelete({ id });

        if (!deleted) {
            return res.status(404).json({ error: "Lista no encontrada" });
        }

        res.json({ message: "Lista eliminada correctamente" });

    } catch (err) {
        console.error("Error deleteList:", err);
        res.status(500).json({ error: "Error al eliminar la lista" });
    }
}

module.exports = {
    getLists,
    getListById,
    createList,
    addMovie,
    removeMovie,
    deleteList
};