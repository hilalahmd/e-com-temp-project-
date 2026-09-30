const express = require('express');
const { getDashboardData, toggleStoreStatus, deleteStore, changeUserRole } = require('./admin.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes are protected and require super_admin role
router.use(protect);
router.use(authorize('super_admin'));

router.get('/dashboard', getDashboardData);
router.put('/stores/:id/toggle', toggleStoreStatus);
router.delete('/stores/:id', deleteStore);
router.put('/users/:id/role', changeUserRole);

module.exports = router;
