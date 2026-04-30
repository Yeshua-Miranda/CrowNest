
const mogoose = require('mongoose');   

const listSchema = {
    id:          "number",   
    userId:      "number",   
    nombre:      "string",  
    descripcion: "string",  
    visibilidad: "string",  
    peliculas: [
        {
            tmdbId:     "number", 
            titulo:     "string",
            poster_path:"string", 
            agregadaEn: "date"    
        }
    ],
    creadaEn:    "date",
    actualizadaEn: "date"
};

module.exports = mogoose.model('List', listSchema);

