const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize'); // MongoDB injection thadayanulla package

const app = express();

// Security headers set cheyyunnu
app.use(helmet());

// Request logging (development samayathu maathram log cheyyam)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// CORS - Production-il strict origin use cheyyanam, illenkil unauthorized access varum
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourproductiondomain.com'] 
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
};
app.use(cors(corsOptions));

// Stripe webhook needs raw body - ithu express.json() munpe aayirikanam
const { handleWebhook } = require('./features/payment/payment.controller');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json()); // Request body parse cheyyanulla middleware
app.use(mongoSanitize()); // NoSQL injection prevent cheyyan ithu add cheyyunnu

// Feature Routes import cheyyunnu
const authRoutes = require('./features/auth/auth.routes');
const tenantRoutes = require('./features/tenant/tenant.routes');
const productRoutes = require('./features/product/product.routes');
const adminRoutes = require('./features/admin/admin.routes');
const orderRoutes = require('./features/order/order.routes');
const analyticsRoutes = require('./features/analytics/analytics.routes');
const uploadRoutes = require('./features/upload/upload.routes');
const couponRoutes = require('./features/coupon/coupon.routes');
const paymentRoutes = require('./features/payment/payment.routes');
const customerRoutes = require('./features/customer/customer.routes');

// Route-kal mount cheyyunnu (API endpoints create cheyyunnu)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 20, // Oru IP-il ninnu 20 requests maathram
    message: { success: false, message: 'Too many attempts, please try again after 15 minutes' }
});
app.use('/api/auth', authLimiter, authRoutes); // Auth route-nu maathram rate limit
app.use('/api/tenant', tenantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);

// Health check cheyyanulla base route (Server run aavunnundo ennu ariyan)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
});

// 404 Handler - route kandillengil ee response pokum
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler - errors ellam ivide varum
app.use((err, req, res, next) => {
    console.error(err.stack); // Error console-il print cheyyunnu
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;
