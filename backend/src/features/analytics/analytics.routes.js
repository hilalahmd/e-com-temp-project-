const express = require('express');
const { getDashboardStats } = require('./analytics.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { resolveAdminTenant } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('shop_owner', 'super_admin'));
router.use(resolveAdminTenant);

router.get('/dashboard', getDashboardStats);

module.exports = router;
