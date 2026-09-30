const express = require('express');
const { createStore, getMyStore, getStoreBySlug, updateStore } = require('./tenant.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { createStoreSchema, updateStoreSchema } = require('./tenant.validation');

const router = express.Router();

// Public routes
router.get('/store/:slug', getStoreBySlug);

// Apply auth middleware to all routes below
router.use(protect);
router.use(authorize('shop_owner', 'super_admin'));

router.post('/store', validate(createStoreSchema), createStore);
router.put('/store', validate(updateStoreSchema), updateStore);
router.get('/my-store', getMyStore);

module.exports = router;
