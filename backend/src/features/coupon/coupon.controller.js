const couponSchema = require('./coupon.schema');

exports.createCoupon = async (req, res, next) => {
    try {
        const Coupon = req.tenantDb.model('Coupon', couponSchema);
        const { code, type, value, minOrderAmount, maxUses, expiresAt, isActive } = req.body;
        
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({ code, type, value, minOrderAmount, maxUses, expiresAt, isActive });
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        next(error);
    }
};

exports.getCoupons = async (req, res, next) => {
    try {
        const Coupon = req.tenantDb.model('Coupon', couponSchema);
        
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        const total = await Coupon.countDocuments(query);
        const coupons = await Coupon.find(query).sort('-createdAt').skip(skip).limit(limit);

        res.status(200).json({
            success: true,
            count: coupons.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: coupons
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCoupon = async (req, res, next) => {
    try {
        const Coupon = req.tenantDb.model('Coupon', couponSchema);
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        next(error);
    }
};

exports.deleteCoupon = async (req, res, next) => {
    try {
        const Coupon = req.tenantDb.model('Coupon', couponSchema);
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

exports.validateCoupon = async (req, res, next) => {
    try {
        const Coupon = req.tenantDb.model('Coupon', couponSchema);
        const { code, orderTotal } = req.body;

        if (!code || orderTotal === undefined) {
            return res.status(400).json({ success: false, message: 'Coupon code and order total are required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: 'Coupon is not active' });
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        if (orderTotal < coupon.minOrderAmount) {
            return res.status(400).json({ success: false, message: `Minimum order amount of ${coupon.minOrderAmount} required` });
        }

        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (orderTotal * coupon.value) / 100;
        } else {
            discountAmount = Math.min(coupon.value, orderTotal); // Discount cannot exceed total
        }

        res.status(200).json({
            success: true,
            data: {
                discountAmount,
                type: coupon.type,
                value: coupon.value
            }
        });
    } catch (error) {
        next(error);
    }
};
