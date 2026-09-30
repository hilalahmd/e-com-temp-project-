const orderSchema = require('../order/order.schema');
const productSchema = require('../product/product.schema');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const Order = req.tenantDb.model('Order', orderSchema);
        const Product = req.tenantDb.model('Product', productSchema);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [orders, totalProducts, lowStockProducts] = await Promise.all([
            Order.find(),
            Product.countDocuments(),
            Product.find({ stock: { $lt: 5 } }).select('name stock')
        ]);

        let totalRevenue = 0;
        let pendingOrders = 0;
        const ordersByStatus = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
        
        orders.forEach(order => {
            if (order.status !== 'Cancelled') totalRevenue += order.totalAmount;
            if (order.status === 'Pending') pendingOrders++;
            if (ordersByStatus[order.status] !== undefined) ordersByStatus[order.status]++;
        });

        const recentOrders = await Order.find().sort('-createdAt').limit(5);
        
        const topProductsAgg = await Order.aggregate([
            { $unwind: "$items" },
            { $group: {
                _id: "$items.productId",
                name: { $first: "$items.name" },
                totalSold: { $sum: "$items.quantity" },
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
            }},
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        const revenueByDay = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'Cancelled' } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" }
            }},
            { $project: { _id: 0, date: "$_id", revenue: 1 } },
            { $sort: { date: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalOrders: orders.length,
                totalProducts,
                pendingOrders,
                revenueByDay,
                ordersByStatus,
                topProducts: topProductsAgg,
                recentOrders,
                lowStockProducts
            }
        });
    } catch (error) {
        next(error);
    }
};
