const router = require('express').Router();
const { getCart, addToCart, updateQuantity, removeFromCart, clearCart } = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.get('/', auth, getCart);
router.post('/add', auth, addToCart);
router.put('/update', auth, updateQuantity);
router.delete('/remove/:productId', auth, removeFromCart);
router.delete('/clear', auth, clearCart);

module.exports = router;
