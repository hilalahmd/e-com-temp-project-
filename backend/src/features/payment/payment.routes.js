const express = require('express');
const { createCheckoutSession, handleWebhook } = require('./payment.controller');
const { resolveTenant } = require('../../middleware/tenant.middleware');

const router = express.Router();

// Create checkout session (public, needs x-tenant-id)
router.post('/create-checkout-session', resolveTenant, createCheckoutSession);

module.exports = router;
