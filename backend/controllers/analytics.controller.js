import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

/**
 * GET /api/admin/analytics
 *
 * Returns overall store metrics along with sales data for the last 7 days.
 * This endpoint powers the admin dashboard analytics widgets and charts.
 */
export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    // Define the 7 day window (including today)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.json({ analyticsData, dailySalesData });
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);

    res.status(500).json({
      message: "Something went wrong while retrieving analytics data.",
    });
  }
};

/**
 * Fetches global store metrics used in admin dashboard summary cards.
 *
 * We run these queries in parallel to reduce total response time.
 * Aggregation is used for sales metrics to avoid transferring large datasets.
 */
async function getAnalyticsData() {
  const [totalUsers, totalProducts, salesData] = await Promise.all([
    // Accurate counts are preferred for admin dashboards
    User.countDocuments(),
    Product.countDocuments(),

    Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]),
  ]);

  // Mongo aggregation returns an empty array if no documents exist
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
}

/**
 * Generates sales + revenue metrics for each day in a date range.
 *
 * Missing days are filled with zero values so charts render correctly
 * even when no orders were placed on certain days.
 */
async function getDailySalesData(startDate, endDate) {
  const dailySalesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          // Convert timestamp to date string for grouping
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "UTC",
          },
        },
        sales: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Create a continuous date range so charts don't skip days
  const dateArray = getDatesInRange(startDate, endDate);

  const salesMap = new Map(dailySalesData.map((item) => [item._id, item]));

  return dateArray.map((date) => {
    const foundData = salesMap.get(date);

    return {
      name: date,
      date,
      sales: foundData?.sales || 0,
      revenue: foundData?.revenue || 0,
    };
  });
}

/**
 * Utility function that returns an array of date strings between two dates.
 * Used to ensure chart data always contains a full date range.
 */
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}
