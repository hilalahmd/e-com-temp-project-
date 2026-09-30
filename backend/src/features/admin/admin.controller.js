const User = require('../auth/auth.model');
const Store = require('../tenant/tenant.model');
const mongoose = require('mongoose');

// @desc    Get all users and stores for super admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Super Admin)
exports.getDashboardData = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').sort('-createdAt');
        const stores = await Store.find({}).populate('ownerId', 'name email').sort('-createdAt');

        // Calculate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
        const newStoresThisMonth = await Store.countDocuments({ createdAt: { $gte: startOfMonth } });
        const activeStores = await Store.countDocuments({ isActive: true });

        // Calculate total revenue across all stores
        let totalPlatformRevenue = 0;
        for (const store of stores) {
            try {
                const dbName = `tenant_${store.storeSlug}`;
                const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });
                const orderSchema = require('../order/order.schema');
                const Order = tenantDb.model('Order', orderSchema);
                const result = await Order.aggregate([
                    { $match: { status: { $ne: 'Cancelled' } } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ]);
                if (result.length > 0) {
                    totalPlatformRevenue += result[0].total;
                }
            } catch (e) {
                // Skip stores with no orders yet
            }
        }

        res.status(200).json({
            success: true,
            data: {
                users,
                stores,
                stats: {
                    totalUsers: users.length,
                    totalStores: stores.length,
                    activeStores,
                    newUsersThisMonth,
                    newStoresThisMonth,
                    totalPlatformRevenue
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle store active status (suspend/activate)
// @route   PUT /api/admin/stores/:id/toggle
// @access  Private (Super Admin)
exports.toggleStoreStatus = async (req, res, next) => {
    try {
        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        store.isActive = !store.isActive;
        await store.save();

        res.status(200).json({
            success: true,
            data: store,
            message: `Store ${store.isActive ? 'activated' : 'suspended'} successfully`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a store and clean up
// @route   DELETE /api/admin/stores/:id
// @access  Private (Super Admin)
exports.deleteStore = async (req, res, next) => {
    try {
        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Remove storeId from the owner user
        await User.findByIdAndUpdate(store.ownerId, { storeId: null });

        // Drop the tenant database
        try {
            const dbName = `tenant_${store.storeSlug}`;
            const tenantDb = mongoose.connection.useDb(dbName);
            await tenantDb.dropDatabase();
        } catch (e) {
            console.error('Error dropping tenant database:', e.message);
        }

        // Delete the store document
        await Store.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: `Store "${store.storeName}" and all its data deleted successfully`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Super Admin)
exports.changeUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['shop_owner', 'super_admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role. Must be shop_owner or super_admin' });
        }

        // Prevent super admin from changing their own role
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: `User role updated to ${role}`
        });
    } catch (error) {
        next(error);
    }
};
