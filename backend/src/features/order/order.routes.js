const express = require('express');
const { createOrder, getOrders, getOrder, trackOrder, updateOrderStatus } = require('./order.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { resolveTenant, resolveAdminTenant } = require('../../middleware/tenant.middleware');
const validate = require('../../middleware/validate.middleware');
const { createOrderSchema, updateOrderStatusSchema } = require('./order.validation');

const router = express.Router();

// Public routes (require x-tenant-id header)
router.post('/', resolveTenant, validate(createOrderSchema), createOrder);
router.get('/track/:id', resolveTenant, trackOrder);

// Protected routes for the shop owner
router.use(protect);
router.use(authorize('shop_owner', 'super_admin'));
router.use(resolveAdminTenant);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
