const orderSchema = require('./order.schema');
const productSchema = require('../product/product.schema');
const couponSchema = require('../coupon/coupon.schema');
const jwt = require('jsonwebtoken');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (Uses x-tenant-id header)
exports.createOrder = async (req, res, next) => {
    try {
        // Tenant database model edukkunnu
        const Order = req.tenantDb.model('Order', orderSchema);
        const Product = req.tenantDb.model('Product', productSchema);
        const Coupon = req.tenantDb.model('Coupon', couponSchema);

        const { customerName, customerPhone, customerAddress, items, couponCode } = req.body;

        let calculatedTotalAmount = 0;
        const processedItems = [];

        // Ovoro item-intem stock check cheythu update cheyyunnu (Atomic update)
        for (const item of items) {
            const product = await Product.findOneAndUpdate(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            // Stock illengil error kanikkunnu
            if (!product) {
                // Munpe update cheytha items pazhayapole aakkunnu (Rollback)
                for (const pItem of processedItems) {
                    await Product.findByIdAndUpdate(pItem.productId, { $inc: { stock: pItem.quantity } });
                }
                const p = await Product.findById(item.productId);
                if (!p) {
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }
                return res.status(400).json({ success: false, message: `Insufficient stock for ${p.name}` });
            }

            // Database-il ninnum price edukkunnu (Security-kku vendi)
            processedItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
            calculatedTotalAmount += (product.price * item.quantity); // Total amount calculate cheyyunnu
        }

        let subtotal = calculatedTotalAmount;
        let discountAmount = 0;

        // Coupon undengil apply cheyyunnu
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon) {
                // Coupon expire aayo ennu check cheyyunnu
                if (coupon.expiresAt && new Date() > coupon.expiresAt) {
                    return res.status(400).json({ success: false, message: 'Coupon has expired' });
                }
                // Coupon usage limit check cheyyunnu
                if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
                    return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
                }
                // Minimum order amount check cheyyunnu
                if (subtotal < coupon.minOrderAmount) {
                    return res.status(400).json({ success: false, message: `Minimum order amount of ${coupon.minOrderAmount} required` });
                }

                // Discount calculate cheyyunnu
                if (coupon.type === 'percentage') {
                    discountAmount = (subtotal * coupon.value) / 100;
                } else {
                    discountAmount = Math.min(coupon.value, subtotal);
                }
            }
        }

        // Final amount calculate cheyyunnu
        calculatedTotalAmount = subtotal - discountAmount;

        // Header-il token undengil customerId edukkunnu
        let customerId = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                customerId = decoded.id;
            } catch (err) {
                // Token invalid aanengil ignore cheyyunnu (guest checkout)
            }
        }

        // Order database-il save cheyyunnu
        const order = await Order.create({
            customerId,
            customerName,
            customerPhone,
            customerAddress,
            items: processedItems,
            subtotal,
            couponCode: couponCode || null,
            discountAmount,
            totalAmount: calculatedTotalAmount,
            paymentMethod: 'COD',
            paymentStatus: 'pending'
        });

        // Coupon used count update cheyyunnu
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        // Pudiya order vannennu real-time aayi shop owner-ne ariyikkunnu (Socket.io vazhi)
        const io = req.app.get('io');
        if (io) {
            io.to(`store_${req.store.storeSlug}`).emit('new_order', {
                orderId: order._id,
                customerName: order.customerName,
                totalAmount: order.totalAmount,
                itemCount: order.items.length,
                createdAt: order.createdAt
            });
        }

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders for a store (with pagination, search, status filter)
// @route   GET /api/orders
// @access  Private (Shop Owner)
exports.getOrders = async (req, res, next) => {
    try {
        const Order = req.tenantDb.model('Order', orderSchema);

        // Query build cheyyunnu
        const query = {};

        // Status filter cheyyan
        if (req.query.status && req.query.status !== 'All') {
            query.status = req.query.status;
        }

        // Customer name allengil phone number vachu search cheyyan
        if (req.query.search) {
            query.$or = [
                { customerName: { $regex: req.query.search, $options: 'i' } },
                { customerPhone: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Pagination variables set cheyyunnu
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        // Sorting options set cheyyunnu
        const sort = req.query.sort || '-createdAt';

        // Orders edukkunnu
        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Shop Owner)
exports.getOrder = async (req, res, next) => {
    try {
        const Order = req.tenantDb.model('Order', orderSchema);
        // ID vachu order edukkunnu
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Track order status (public)
// @route   GET /api/orders/track/:id
// @access  Public (Uses x-tenant-id header)
exports.trackOrder = async (req, res, next) => {
    try {
        const Order = req.tenantDb.model('Order', orderSchema);
        // Order track cheyyan status-um details-um edukkunnu
        const order = await Order.findById(req.params.id).select('status items totalAmount createdAt');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Shop Owner)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const Order = req.tenantDb.model('Order', orderSchema);
        const { status } = req.body;

        const oldOrder = await Order.findById(req.params.id);
        if (!oldOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Order status update cheyyunnu
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

        // Order cancel cheyyukayaanengil stock thirichu aakkunnu
        if (status === 'Cancelled' && oldOrder.status !== 'Cancelled') {
            const Product = req.tenantDb.model('Product', productSchema);
            for (const item of oldOrder.items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
            }
        }

        // Order status maariya vivaram socket.io vazhi ariyikkunnu
        const io = req.app.get('io');
        if (io) {
            io.to(`store_${req.store.storeSlug}`).emit('order_status_updated', {
                orderId: order._id,
                status: order.status
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};
