const Review = require('../models/review.js');
const User = require('../models/user.js');
const mongoose = require('mongoose');

exports.createReview = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id; 

        const nuevaResena = new Review({
            userId: userId,
            movieId: req.body.movieId,
            movieTitle: req.body.movieTitle,
            moviePoster: req.body.moviePoster,
            rating: req.body.rating,
            reviewText: req.body.reviewText,
            isWatched: req.body.isWatched,
            watchedAt: req.body.watchedAt
        });

        const resenaGuardada = await nuevaResena.save();
        
        return res.status(201).json({
            msg: "Reseña guardada con éxito",
            review: resenaGuardada
        });

    } catch (err) {
        return res.status(400).json({ msg: err.message, status: 400 });
    } 
};

exports.getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        const reviews = await Review.find({ userId: userId }).sort({ createdAt: -1 }); // Lo ordena de reciente a antiguo

        return res.json(reviews);
    } catch (err) {
        return res.status(500).json({ msg: "Error al obtener reseñas", status: 500 });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id; 
        const userId = req.user._id || req.user.id;


        const review = await Review.findOne({ _id: reviewId, userId: userId });

        if (!review) {
            return res.status(404).json({ msg: "Reseña no encontrada o no autorizada" });
        }

        const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, { new: true, runValidators: true });// Hace las validaciones

        return res.json({
            msg: "Reseña actualizada",
            review: updatedReview
        });

    } catch (err) {
        return res.status(400).json({ msg: err.message, status: 400 });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user._id || req.user.id;

        const deletedReview = await Review.findOneAndDelete({ _id: reviewId, userId: userId });

        if (!deletedReview) {
            return res.status(404).json({ msg: "Reseña no encontrada o no autorizada" });
        }

        return res.json({ msg: "Reseña eliminada correctamente" });

    } catch (err) {
        return res.status(500).json({ msg: "Error al eliminar reseña", status: 500 });
    }
};

exports.getMovieReviews = async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const { page = 1, limit = 5, rating, autor, amigosDe } = req.query; 

        let filtro = { movieId: movieId };

        if (amigosDe) {
            const usuarioActual = await User.findById(amigosDe);
            
            if (usuarioActual && usuarioActual.friends && usuarioActual.friends.length > 0) {
                // Convertimos los Strings a ObjectIds reales de Mongo
                const amigosIds = usuarioActual.friends.map(id => new mongoose.Types.ObjectId(id));
                filtro.userId = { $in: amigosIds };
            } else {
                // Si no tiene amigos, forzamos un ID que no exista para que no traiga nada
                filtro.userId = new mongoose.Types.ObjectId(); 
            }
        } 
        
        else if (autor) {
            filtro.userId = new mongoose.Types.ObjectId(autor);
        }
        
      
        if (rating && !["Todas", "Amigos", "Mias"].includes(rating)) {
            filtro.rating = Number(rating);
        }

        const skip = (page - 1) * limit;

        const reviews = await Review.find(filtro)
            .populate('userId', 'name email profile_photo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const totalReviews = await Review.countDocuments(filtro);

        return res.json({
            reviews: reviews,
            totalPages: Math.ceil(totalReviews / limit),
            currentPage: Number(page),
            totalReviews: totalReviews
        });

    } catch (err) {
        console.error("ERROR CRÍTICO:", err);
        return res.status(500).json({ msg: "Error en el servidor", status: 500 });
    }
};

