const Store = require('./tenant.model');
const User = require('../auth/auth.model');

// @desc    Create a new store for the authenticated user
// @route   POST /api/tenant/store
// @access  Private (Shop Owner)
exports.createStore = async (req, res, next) => {
    try {
        const { storeName, whatsappNumber, category, logoUrl, heroBgUrl, themeColor } = req.body;

        if (!storeName || !whatsappNumber) {
            return res.status(400).json({ success: false, message: 'Store name and WhatsApp number are required' });
        }

        // Check if user already has a store
        const existingStore = await Store.findOne({ ownerId: req.user._id });
        if (existingStore) {
            return res.status(400).json({ success: false, message: 'You already own a store' });
        }

        // Generate a URL-friendly slug
        const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Ensure slug is unique across the platform
        const slugExists = await Store.findOne({ storeSlug });
        if (slugExists) {
            return res.status(400).json({ success: false, message: 'Store name is taken, please choose another' });
        }

        // Create the store in Master DB
        const store = await Store.create({
            ownerId: req.user._id,
            storeName,
            storeSlug,
            whatsappNumber,
            category: category || 'General Retail',
            logoUrl: logoUrl || 'https://via.placeholder.com/150?text=Logo',
            heroBgUrl: heroBgUrl || '',
            theme: { primaryColor: themeColor || '#000000', fontFamily: 'Inter' }
        });

        // Update the user's record with the storeId
        await User.findByIdAndUpdate(req.user._id, { storeId: store._id });

        res.status(201).json({
            success: true,
            data: store,
            message: `Store ${store.storeName} successfully created! Your database is ready.`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user's store
// @route   GET /api/tenant/my-store
// @access  Private (Shop Owner)
exports.getMyStore = async (req, res, next) => {
    try {
        const store = await Store.findOne({ ownerId: req.user._id });

        if (!store) {
            return res.status(404).json({ success: false, message: 'No store found for this user' });
        }

        res.status(200).json({ success: true, data: store });
    } catch (error) {
        next(error);
    }
};

// @desc    Update store settings
// @route   PUT /api/tenant/store
// @access  Private (Shop Owner)
exports.updateStore = async (req, res, next) => {
    try {
        const { storeName, whatsappNumber, category, logoUrl, heroBgUrl, themeColor } = req.body;

        let store = await Store.findOne({ ownerId: req.user._id });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        store.storeName = storeName || store.storeName;
        store.whatsappNumber = whatsappNumber || store.whatsappNumber;
        store.category = category || store.category;
        store.logoUrl = logoUrl !== undefined ? logoUrl : store.logoUrl;
        store.heroBgUrl = heroBgUrl !== undefined ? heroBgUrl : store.heroBgUrl;
        
        if (themeColor) {
            store.theme.primaryColor = themeColor;
        }

        await store.save();

        res.status(200).json({ success: true, data: store, message: 'Store settings updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get store info publicly by slug
// @route   GET /api/tenant/store/:slug
// @access  Public
exports.getStoreBySlug = async (req, res, next) => {
    try {
        const store = await Store.findOne({ storeSlug: req.params.slug });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        res.status(200).json({
            success: true,
            data: {
                storeName: store.storeName,
                whatsappNumber: store.whatsappNumber,
                storeSlug: store.storeSlug,
                logoUrl: store.logoUrl,
                heroBgUrl: store.heroBgUrl,
                category: store.category,
                theme: store.theme
            }
        });
    } catch (error) {
        next(error);
    }
};
