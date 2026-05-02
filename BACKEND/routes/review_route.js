const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review_api_controllers.js');

const { authMiddelwere } = require('../controllers/users_api_controllers.js'); 

router.post('/crear', authMiddelwere, reviewController.createReview);

router.get('/mis-resenas', authMiddelwere, reviewController.getUserReviews);

router.put('/editar/:id', authMiddelwere, reviewController.updateReview);

router.delete('/borrar/:id', authMiddelwere, reviewController.deleteReview);

module.exports = router;