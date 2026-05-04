const Review = require('../models/review.js');

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
        // Paginación y filtro de estrellas vienen por query params
        const { page = 1, limit = 5, rating } = req.query; 

        let filtro = { movieId: movieId };

        // filtrar por estrella
        if (rating && rating !== "Todas" && rating !== "Amigos") {
            filtro.rating = Number(rating);
        }

        const skip = (page - 1) * limit;

        // Buscamos los datos en mongodb
        const reviews = await Review.find(filtro)
            .populate('userId', 'name email')
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
        return res.status(500).json({ msg: "Error al obtener reseñas de la película", status: 500 });
    }
};