import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Package, Calendar, X } from 'lucide-react';
import { initDatabase, getDatabase } from '../../lib/database';

// Simple date formatter
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface OrderData {
  id: string;
  total_amount: number;
  created_at: string;
  status: string;
  order_items: Array<{
    product_id: string;
    quantity: number;
    price_at_time: number;
    products: {
      name: string;
    };
  }>;
}

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  salesByDay: Array<{ date: string; amount: number }>;
}

type FilterPeriod = 'day' | 'week' | 'month' | 'year' | 'custom';

export function Analytics() {
  const [period, setPeriod] = useState<FilterPeriod>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [],
    salesByDay: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period, startDate, endDate]);

  const handleOpenCustomModal = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowCustomModal(true);
  };

  const handleApplyCustomDates = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPeriod('custom');
    setShowCustomModal(false);
  };

  const handleCancelCustomDates = () => {
    setShowCustomModal(false);
  };

  const getDateRange = () => {
    const now = new Date();
    let start = new Date();

    switch (period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          return { start: new Date(startDate), end: new Date(endDate) };
        }
        start.setDate(now.getDate() - 7);
        break;
    }

    return { start, end: now };
  };



const fetchAnalytics = async () => {
  try {
    setLoading(true);
    await initDatabase();
    const db = getDatabase();
    const { start, end } = getDateRange();

    // Get all completed orders in date range
    const ordersResult = db.exec(`
      SELECT o.*, oi.product_id, oi.quantity, oi.price_at_time, p.name as product_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'completed'
        AND o.created_at >= ?
        AND o.created_at <= ?
      ORDER BY o.created_at ASC
    `, [start.toISOString(), end.toISOString()]);

    if (ordersResult.length === 0) {
      setAnalytics({
        totalSales: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        topProducts: [],
        salesByDay: [],
      });
      return;
    }

    const columns = ordersResult[0].columns;
    const rows = ordersResult[0].values;

    // Parse results
    const orders: any[] = [];
    const orderMap = new Map();

    rows.forEach(row => {
      const orderData: any = {};
      columns.forEach((col, idx) => {
        orderData[col] = row[idx];
      });

      if (!orderMap.has(orderData.id)) {
        orderMap.set(orderData.id, {
          id: orderData.id,
          total_amount: orderData.total_amount,
          created_at: orderData.created_at,
          items: []
        });
      }

      if (orderData.product_id) {
        orderMap.get(orderData.id).items.push({
          product_id: orderData.product_id,
          product_name: orderData.product_name,
          quantity: orderData.quantity,
          price_at_time: orderData.price_at_time
        });
      }
    });

    const ordersArray = Array.from(orderMap.values());

    // Calculate analytics
    const totalSales = ordersArray.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = ordersArray.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Top products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    ordersArray.forEach(order => {
      order.items.forEach((item: any) => {
        const existing = productMap.get(item.product_id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price_at_time * item.quantity;
        } else {
          productMap.set(item.product_id, {
            name: item.product_name,
            quantity: item.quantity,
            revenue: item.price_at_time * item.quantity,
          });
        }
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sales by day
    const salesMap = new Map<string, number>();
    ordersArray.forEach(order => {
      const date = formatDate(order.created_at);
      salesMap.set(date, (salesMap.get(date) || 0) + order.total_amount);
    });

    const salesByDay = Array.from(salesMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .slice(-7);

    setAnalytics({
      totalSales,
      totalOrders,
      avgOrderValue,
      topProducts,
      salesByDay,
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
  } finally {
    setLoading(false);
  }
};

// Keep everything else the same!

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const maxSales = Math.max(...analytics.salesByDay.map(d => d.amount), 1);

  return (
    <div className="p-4">
      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {(['day', 'week', 'month', 'year'] as FilterPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <button
            onClick={handleOpenCustomModal}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar size={16} className="inline mr-1" />
            Custom
          </button>
        </div>
      </div>

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Select Date Range</h3>
              <button
                onClick={handleCancelCustomDates}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={e => setTempStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={e => setTempEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={handleCancelCustomDates}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomDates}
                disabled={!tempStartDate || !tempEndDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} />
            <span className="text-sm opacity-90">Total Sales</span>
          </div>
          <p className="text-2xl font-bold">${analytics.totalSales.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={20} />
            <span className="text-sm opacity-90">Orders</span>
          </div>
          <p className="text-2xl font-bold">{analytics.totalOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm opacity-90">Avg Order Value</span>
          </div>
          <p className="text-2xl font-bold">${analytics.avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} />
          Sales Trend
        </h3>
        {analytics.salesByDay.length > 0 ? (
          <div className="space-y-3">
            {analytics.salesByDay.map((day, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{day.date}</span>
                  <span className="font-semibold text-gray-800">
                    ${day.amount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(day.amount / maxSales) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No sales data</p>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={18} />
          Top Products
        </h3>
        {analytics.topProducts.length > 0 ? (
          <div className="space-y-3">
            {analytics.topProducts.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">{product.quantity} sold</p>
                </div>
                <p className="font-bold text-blue-600">
                  ${product.revenue.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No product data</p>
        )}
      </div>
    </div>
  );
}