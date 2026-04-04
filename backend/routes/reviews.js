const router = require('express').Router();
const { createReview, getProductReviews, checkEligibility } = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/', auth, createReview);
router.get('/:productId', getProductReviews);
router.get('/check-eligibility/:productId', auth, checkEligibility);

module.exports = router;
