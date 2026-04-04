const router = require('express').Router();
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, createOrder);
router.get('/user', auth, getUserOrders);
router.get('/', auth, admin, getAllOrders);
router.get('/stats', auth, admin, getOrderStats);
router.put('/:id/status', auth, admin, updateOrderStatus);

// Cancellation & Invoice Routes
const { cancelOrderAction, getCancellationRequests, processCancellationRequest, generateInvoice } = require('../controllers/orderController');
router.post('/:id/cancel', auth, cancelOrderAction);
router.get('/:id/invoice', auth, generateInvoice);
router.get('/admin/cancellation-requests', auth, admin, getCancellationRequests);
router.put('/admin/cancellation-requests/:id/process', auth, admin, processCancellationRequest);

module.exports = router;
