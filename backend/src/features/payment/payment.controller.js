const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const orderSchema = require('../order/order.schema');
const productSchema = require('../product/product.schema');
const couponSchema = require('../coupon/coupon.schema');

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res, next) => {
    try {
        const Order = req.tenantDb.model('Order', orderSchema);
        const Product = req.tenantDb.model('Product', productSchema);

        const { customerName, customerPhone, customerAddress, items, couponCode } = req.body;

        // Calculate items with server prices
        let subtotal = 0;
        const processedItems = [];
        const lineItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }
            
            processedItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
            subtotal += product.price * item.quantity;

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: product.imageUrl ? [product.imageUrl] : [],
                    },
                    unit_amount: Math.round(product.price * 100), // Stripe uses cents
                },
                quantity: item.quantity,
            });
        }

        // Apply coupon if provided
        let discountAmount = 0;
        if (couponCode) {
            const Coupon = req.tenantDb.model('Coupon', couponSchema);
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon) {
                if (coupon.type === 'percentage') {
                    discountAmount = (subtotal * coupon.value) / 100;
                } else {
                    discountAmount = Math.min(coupon.value, subtotal);
                }
            }
        }

        const totalAmount = subtotal - discountAmount;

        // Create order first with pending payment
        const order = await Order.create({
            customerName,
            customerPhone,
            customerAddress,
            items: processedItems,
            subtotal,
            couponCode: couponCode || null,
            discountAmount,
            totalAmount,
            paymentMethod: 'Online',
            paymentStatus: 'pending'
        });

        // Deduct stock
        for (const item of processedItems) {
            await Product.findOneAndUpdate(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
        }

        // If discount, add a negative line item
        if (discountAmount > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Discount (${couponCode})` },
                    unit_amount: -Math.round(discountAmount * 100),
                },
                quantity: 1,
            });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin}/order-confirmation/${order._id}?store=${req.store.storeSlug}&payment=success`,
            cancel_url: `${req.headers.origin}/checkout?store=${req.store.storeSlug}&payment=cancelled`,
            metadata: {
                orderId: order._id.toString(),
                storeSlug: req.store.storeSlug,
            },
        });

        // Save stripe session ID
        order.stripeSessionId = session.id;
        await order.save();

        res.status(200).json({
            success: true,
            data: {
                sessionId: session.id,
                sessionUrl: session.url,
                orderId: order._id
            }
        });
    } catch (error) {
        next(error);
    }
};

// Stripe webhook to confirm payment
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { orderId, storeSlug } = session.metadata;

        try {
            const mongoose = require('mongoose');
            const dbName = `tenant_${storeSlug}`;
            const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });
            const Order = tenantDb.model('Order', orderSchema);
            
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'paid',
                status: 'Processing'
            });

            // Increment coupon usage if applicable
            const order = await Order.findById(orderId);
            if (order && order.couponCode) {
                const Coupon = tenantDb.model('Coupon', couponSchema);
                await Coupon.findOneAndUpdate(
                    { code: order.couponCode },
                    { $inc: { usedCount: 1 } }
                );
            }
        } catch (e) {
            console.error('Error updating order after payment:', e);
        }
    }

    res.json({ received: true });
};
