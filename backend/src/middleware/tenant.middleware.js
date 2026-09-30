const mongoose = require('mongoose');
const Store = require('../features/tenant/tenant.model');

// Middleware to resolve the tenant (Store) based on headers or subdomain
// This will be used for Public Storefront APIs (Products, Cart, Orders)
exports.resolveTenant = async (req, res, next) => {
    try {
        // For development/MVP, we expect the frontend to send the store identifier in headers
        // In production, you might extract this from the req.hostname (subdomain)
        const tenantId = req.headers['x-tenant-id'];

        if (!tenantId) {
            return res.status(400).json({ success: false, message: 'Tenant ID is required in headers' });
        }

        // Verify the store exists in the master database
        const store = await Store.findOne({ storeSlug: tenantId });
        
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        if (!store.isActive) {
            return res.status(403).json({ success: false, message: 'This store is currently unavailable' });
        }

        // Switch to the Tenant's specific database dynamically
        const dbName = `tenant_${store.storeSlug}`;
        
        // We use mongoose.connection.useDb to get a connection instance for the specific DB
        const tenantDbConnection = mongoose.connection.useDb(dbName, { useCache: true });

        // Attach the connection and store details to the request object
        req.tenantDb = tenantDbConnection;
        req.store = store;

        next();
    } catch (error) {
        console.error('Tenant Resolution Error:', error);
        res.status(500).json({ success: false, message: 'Server error during tenant resolution' });
    }
};

// Middleware to resolve the tenant for an Admin (Shop Owner) based on their JWT token
exports.resolveAdminTenant = async (req, res, next) => {
    try {
        if (!req.user || !req.user.storeId) {
            return res.status(403).json({ success: false, message: 'User does not have an active store. Please create a store first.' });
        }
        
        const store = await Store.findById(req.user.storeId);
        if (!store) {
             return res.status(404).json({ success: false, message: 'Store not found in master database' });
        }

        const dbName = `tenant_${store.storeSlug}`;
        req.tenantDb = mongoose.connection.useDb(dbName, { useCache: true });
        req.store = store;
        
        next();
    } catch (error) {
        console.error('Admin Tenant Resolution Error:', error);
        res.status(500).json({ success: false, message: 'Server error during admin tenant resolution' });
    }
};
