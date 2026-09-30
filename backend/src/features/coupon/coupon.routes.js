const express = require('express');
const { createCoupon, getCoupons, updateCoupon, deleteCoupon, validateCoupon } = require('./coupon.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { resolveTenant, resolveAdminTenant } = require('../../middleware/tenant.middleware');
const { validateCouponInput } = require('./coupon.validation');

const router = express.Router();

// Public endpoint for checkout validation
router.post('/validate', resolveTenant, validateCoupon);

// Protected routes (Admin/Shop Owner only)
router.use(protect, authorize('admin', 'shop_owner'));

router.route('/')
    .get(resolveAdminTenant, getCoupons)
    .post(resolveAdminTenant, validateCouponInput, createCoupon);

router.route('/:id')
    .put(resolveAdminTenant, validateCouponInput, updateCoupon)
    .delete(resolveAdminTenant, deleteCoupon);

module.exports = router;
