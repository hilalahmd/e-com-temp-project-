const productSchema = require('./product.schema');

// @desc    Get all products for a specific store
// @route   GET /api/products
// @access  Public (Uses x-tenant-id header)
exports.getProducts = async (req, res, next) => {
    try {
        const Product = req.tenantDb.model('Product', productSchema);

        let query = { isActive: true };

        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.category) {
            query.category = req.query.category;
        }

        let mQuery = Product.find(query);

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            mQuery = mQuery.sort(sortBy);
        } else {
            mQuery = mQuery.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        mQuery = mQuery.skip(skip).limit(limit);

        const products = await mQuery;
        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const Product = req.tenantDb.model('Product', productSchema);
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Shop Owner - uses JWT token to find tenant)
exports.createProduct = async (req, res, next) => {
    try {
        const Product = req.tenantDb.model('Product', productSchema);

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Shop Owner)
exports.updateProduct = async (req, res, next) => {
    try {
        const Product = req.tenantDb.model('Product', productSchema);
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Shop Owner)
exports.deleteProduct = async (req, res, next) => {
    try {
        const Product = req.tenantDb.model('Product', productSchema);
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update stock quantity
// @route   PUT /api/products/:id/stock
// @access  Private (Shop Owner)
exports.updateStock = async (req, res, next) => {
    try {
        const Product = req.tenantDb.model('Product', productSchema);
        const { stock } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};
