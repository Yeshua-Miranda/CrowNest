
const mogoose = require('mongoose');   

const listSchema = {
    id:          { type: "number",  required: true },
    userId:      { type: "number",  required: true },
    nombre:      { type: "string",  required: [true, "La lista debe tener nombre"] },
    descripcion: { type: "string",  required: false },
    visibilidad: { type: "string",  required: [true, "Debes asignar visibilidad"] },
    peliculas: [
        {
            tmdbId:      { type: "number", required: true },
            titulo:      { type: "string", required: true },
            poster_path: { type: "string", required: true },
            agregadaEn:  { type: "date",   required: true }
        }
    ],
    creadaEn:      { type: "date", required: true },
    actualizadaEn: { type: "date", required: true }
};

module.exports = mogoose.model('List', listSchema);

