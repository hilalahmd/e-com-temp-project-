const jwt = require('jsonwebtoken');
const customerSchema = require('../features/customer/customer.schema');

exports.protectCustomer = async (req, res, next) => {
    let token;

    // Header-il ninnu token edukkunnu
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Token verify cheyyunnu
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tenant DB ninnu Customer model edukkunnu
        const Customer = req.tenantDb.model('Customer', customerSchema);
        
        const customer = await Customer.findById(decoded.id);
        
        if (!customer) {
            return res.status(401).json({ success: false, message: 'Customer no longer exists' });
        }

        // Customer block aayittundengil access deny cheyyunnu
        if (customer.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been blocked' });
        }

        req.customer = customer;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};
