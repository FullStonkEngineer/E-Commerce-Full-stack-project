import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../../../lib/axios.js";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import AnalyticsCard from "./AnalyticsCard.jsx";
import Card from "../../ui/Card.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { slideUp } from "../../../lib/animations.js";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/analytics");
      if (!res.data.analyticsData || !res.data.dailySalesData)
        throw new Error("Malformed response");
      setAnalyticsData(res.data.analyticsData);
      setDailySalesData(res.data.dailySalesData);
    } catch (err) {
      setError(
        err.response?.status === 403
          ? "No permission"
          : "Failed to load analytics",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAnalyticsData = async () => {
      fetchAnalytics();
    };

    fetchAnalyticsData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) return <div>Loading analytics…</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <AnalyticsCard
          title='Total Users'
          value={analyticsData.users.toLocaleString()}
          icon={Users}
          color='from-emerald-500 to-teal-700'
        />
        <AnalyticsCard
          title='Total Products'
          value={analyticsData.products.toLocaleString()}
          icon={Package}
          color='from-emerald-500 to-green-700'
        />
        <AnalyticsCard
          title='Total Sales'
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color='from-emerald-500 to-cyan-700'
        />
        <AnalyticsCard
          title='Total Revenue'
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color='from-emerald-500 to-lime-700'
        />
      </div>
      <motion.div {...slideUp(0.25)}>
        <Card className='p-6 bg-gray-800/60'>
          <ResponsiveContainer width='100%' height={400}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' stroke='#D1D5DB' />
              <YAxis yAxisId='left' stroke='#D1D5DB' />
              <YAxis yAxisId='right' orientation='right' stroke='#D1D5DB' />
              <Tooltip />
              <Legend />
              <Line
                yAxisId='left'
                type='monotone'
                dataKey='sales'
                stroke='#10B981'
                activeDot={{ r: 8 }}
                name='Sales'
              />
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='revenue'
                stroke='#3B82F6'
                activeDot={{ r: 8 }}
                name='Revenue'
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  );
};
export default AnalyticsTab;
