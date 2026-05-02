const Review = require('../models/review.js');

// ==========================================
// C: CREATE (Crear una reseña)
// ==========================================
exports.createReview = async (req, res) => {
    try {
        // req.user viene del authMiddelwere. Sacamos su ID (asumiendo que en tu JWT guardas el _id)
        const userId = req.user._id || req.user.id; 

        // Unimos los datos que mandó el frontend con el ID del usuario
        const nuevaResena = new Review({
            ...req.body,
            userId: userId 
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

// ==========================================
// R: READ (Leer las reseñas del usuario)
// ==========================================
exports.getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        // Buscamos todas las reseñas que le pertenezcan a este usuario
        const reviews = await Review.find({ userId: userId }).sort({ createdAt: -1 });

        return res.json(reviews);
    } catch (err) {
        return res.status(500).json({ msg: "Error al obtener reseñas", status: 500 });
    }
};

// ==========================================
// U: UPDATE (Editar una reseña)
// ==========================================
exports.updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id; // El ID de la reseña viene en la URL
        const userId = req.user._id || req.user.id;

        // Buscamos la reseña por ID y aseguramos que le pertenezca a quien la quiere editar
        const review = await Review.findOne({ _id: reviewId, userId: userId });

        if (!review) {
            return res.status(404).json({ msg: "Reseña no encontrada o no autorizada" });
        }

        // Actualizamos (el {new: true} es para que nos devuelva la versión ya actualizada)
        const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, { new: true, runValidators: true });

        return res.json({
            msg: "Reseña actualizada",
            review: updatedReview
        });

    } catch (err) {
        return res.status(400).json({ msg: err.message, status: 400 });
    }
};

// ==========================================
// D: DELETE (Eliminar una reseña)
// ==========================================
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user._id || req.user.id;

        // Eliminamos asegurándonos de que el usuario es el dueño
        const deletedReview = await Review.findOneAndDelete({ _id: reviewId, userId: userId });

        if (!deletedReview) {
            return res.status(404).json({ msg: "Reseña no encontrada o no autorizada" });
        }

        return res.json({ msg: "Reseña eliminada correctamente" });

    } catch (err) {
        return res.status(500).json({ msg: "Error al eliminar reseña", status: 500 });
    }
};