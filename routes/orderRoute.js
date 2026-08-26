import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { protect, restrictToAdmin } from '../controllers/authController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(orderController.getAllOrders)
    .post(orderController.createOrder);

router.route('/cart')
    .get(orderController.getAllCartOrders)
    .post(orderController.addToCart);

router.get('/checkout/summary', orderController.getCheckoutSummary);
router.post('/checkout', orderController.checkout);

router.get('/me', orderController.getMyOrders);
router.get('/me/current', orderController.getMyCurrentOrders);
router.get('/me/previous', orderController.getMyPreviousOrders);

router.get('/chef', orderController.getChefOrders);
router.get('/chef/current', orderController.getChefCurrentOrders);
router.get('/chef/previous', orderController.getChefPreviousOrders);

router.route('/:id')
    .get(orderController.getOrder);

router.patch('/:id/status', restrictToAdmin, orderController.updateOrderStatus);
router.patch('/:id/accept', orderController.acceptOrder);
router.patch('/:id/reject', orderController.rejectOrder);
router.patch('/:id/deliver', orderController.deliverOrder);

export default router;
