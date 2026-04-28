
const mogoose = require('mongoose');   

const reviewSchema = new mogoose.Schema({
    
    userId: { type: Numbre, required : true},

    // Información de la API
    movieId: { type: Number, required: [true, "El ID de la película es obligatorio"] },
    movieTitle: { type: String, required: [true, "El título de la película es obligatorio"] },
    moviePoster: { type: String },

    rating: { 
        type: Number, 
        required: [true, "Debes dar una calificación"],
        min: [0.5, "La calificación mínima es 0.5"],
        max: [5, "La calificación máxima es 5"]
    },
    
    reviewText: { type: String,
        maxlength: [1500, "La reseña no puede exceder los 1,500 caracteres"]

    },

    // Si la vio
    isWatched: { 
        type: Boolean, 
        default: false 
    },

    watchedAt: { 
        type: Date, 
        required: [true, 'Debes indicar cuándo viste la película']
    },
    }, {
    // genera automáticamente "createdAt"        
    timestamps: true
    
});

module.exports = mogoose.model('Review', reviewSchema);

