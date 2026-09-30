const express = require('express');
const { getProducts, createProduct, updateStock, getProduct, updateProduct, deleteProduct } = require('./product.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { resolveTenant, resolveAdminTenant } = require('../../middleware/tenant.middleware');
const validate = require('../../middleware/validate.middleware');
const { createProductSchema, updateProductSchema, updateStockSchema } = require('./product.validation');

const router = express.Router();

router.get('/', resolveTenant, getProducts);
router.get('/:id', resolveTenant, getProduct);

router.use(protect);
router.use(authorize('shop_owner', 'super_admin'));
router.post('/', resolveAdminTenant, validate(createProductSchema), createProduct);
router.put('/:id', resolveAdminTenant, validate(updateProductSchema), updateProduct);
router.delete('/:id', resolveAdminTenant, deleteProduct);
router.put('/:id/stock', resolveAdminTenant, validate(updateStockSchema), updateStock);

module.exports = router;
