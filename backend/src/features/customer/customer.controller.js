const jwt = require('jsonwebtoken');
const customerSchema = require('./customer.schema');
const orderSchema = require('../order/order.schema');

// JWT generate cheyyanulla helper function
const getSignedJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Register new customer
// @route   POST /api/customers/register
// @access  Public (Uses x-tenant-id header)
exports.register = async (req, res, next) => {
    try {
        const Customer = req.tenantDb.model('Customer', customerSchema);
        const { name, email, password, phone, address } = req.body;

        // Email already undonnu check cheyyunnu
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Pudiya customer-ne create cheyyunnu
        const customer = await Customer.create({
            name,
            email,
            password,
            phone,
            address
        });

        // Token generate cheythu send cheyyunnu
        const token = getSignedJwtToken(customer._id);

        res.status(201).json({
            success: true,
            token,
            data: {
                _id: customer._id,
                name: customer.name,
                email: customer.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login customer
// @route   POST /api/customers/login
// @access  Public (Uses x-tenant-id header)
exports.login = async (req, res, next) => {
    try {
        const Customer = req.tenantDb.model('Customer', customerSchema);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Customer-ne db-yil thedunnu
        const customer = await Customer.findOne({ email }).select('+password');
        if (!customer) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Blocked aano ennu check cheyyunnu
        if (customer.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been blocked' });
        }

        // Password match aavunnundo ennu check cheyyunnu
        const isMatch = await customer.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Token generate cheythu send cheyyunnu
        const token = getSignedJwtToken(customer._id);

        res.status(200).json({
            success: true,
            token,
            data: {
                _id: customer._id,
                name: customer.name,
                email: customer.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get customer profile and order history
// @route   GET /api/customers/me
// @access  Private/Customer (Uses x-tenant-id header)
exports.getProfile = async (req, res, next) => {
    try {
        const Order = req.tenantDb.model('Order', orderSchema);
        const customer = req.customer; // Middleware ninnu varunnathu

        // Customer-nte order history edukkunnu
        const orders = await Order.find({ customerId: customer._id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            data: {
                profile: customer,
                orders
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all store customers
// @route   GET /api/customers
// @access  Private (Shop Owner)
exports.getStoreCustomers = async (req, res, next) => {
    try {
        const Customer = req.tenantDb.model('Customer', customerSchema);
        const Order = req.tenantDb.model('Order', orderSchema);

        const customers = await Customer.find().select('-password').lean();

        // Aggregated data calculate cheyyunnu (Total orders & total spent)
        const customersWithStats = await Promise.all(
            customers.map(async (customer) => {
                const orders = await Order.find({ customerId: customer._id });
                const totalOrders = orders.length;
                const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                
                return {
                    ...customer,
                    totalOrders,
                    totalSpent
                };
            })
        );

        res.status(200).json({
            success: true,
            count: customersWithStats.length,
            data: customersWithStats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle block status of a customer
// @route   PUT /api/customers/:id/block
// @access  Private (Shop Owner)
exports.toggleBlock = async (req, res, next) => {
    try {
        const Customer = req.tenantDb.model('Customer', customerSchema);
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Block status toggle cheyyunnu
        customer.isBlocked = !customer.isBlocked;
        await customer.save();

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};
