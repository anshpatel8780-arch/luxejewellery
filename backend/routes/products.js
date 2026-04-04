const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getStats } = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/stats', auth, admin, getStats);
router.get('/:id', getProduct);
router.post('/', auth, admin, upload.array('images', 10), createProduct);
router.put('/:id', auth, admin, upload.array('images', 10), updateProduct);
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
