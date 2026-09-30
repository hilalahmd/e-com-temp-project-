const express = require('express');
const { register, login, getProfile, getStoreCustomers, toggleBlock } = require('./customer.controller');
const { resolveTenant, resolveAdminTenant } = require('../../middleware/tenant.middleware');
const { protectCustomer } = require('../../middleware/customerAuth.middleware');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes (Customers interacting with Storefront)
router.post('/register', resolveTenant, register);
router.post('/login', resolveTenant, login);

// Protected route for Customers (Storefront)
router.get('/me', resolveTenant, protectCustomer, getProfile);

// Protected routes for Admin (Shop Owner managing customers)
router.get('/', protect, authorize('shop_owner'), resolveAdminTenant, getStoreCustomers);
router.put('/:id/block', protect, authorize('shop_owner'), resolveAdminTenant, toggleBlock);

module.exports = router;
