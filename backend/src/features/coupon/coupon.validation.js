const Joi = require('joi');

exports.validateCouponInput = (req, res, next) => {
    const schema = Joi.object({
        code: Joi.string().trim().required(),
        type: Joi.string().valid('percentage', 'fixed').required(),
        value: Joi.number().min(0).required(),
        minOrderAmount: Joi.number().min(0).optional(),
        maxUses: Joi.number().min(1).allow(null).optional(),
        expiresAt: Joi.date().allow(null).optional(),
        isActive: Joi.boolean().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};
