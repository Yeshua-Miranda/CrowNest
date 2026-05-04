const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    id:          { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nombre:      { type: String, required: [true, "La lista debe tener nombre"] },
    descripcion: { type: String },
    visibilidad: { type: String, required: [true, "Debes asignar visibilidad"] },
    peliculas: [
        {
            tmdbId:      { type: Number, required: true },
            titulo:      { type: String, required: true },
            poster_path: { type: String, required: true },
            año:         { type: String, required: false },
            agregadaEn:  { type: Date, default: Date.now }
        }
    ],
    creadaEn:      { type: Date, default: Date.now },
    actualizadaEn: { type: Date, default: Date.now },
    isDefault: { type: Boolean, default: false }
});

module.exports = mongoose.model('List', listSchema);