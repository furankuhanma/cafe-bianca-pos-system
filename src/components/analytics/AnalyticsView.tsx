import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Package, Calendar } from 'lucide-react';

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
      const { start, end } = getDateRange();

      // Only fetch completed orders for analytics
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/orders?select=*,order_items(*,products(*))&created_at=gte.${start.toISOString()}&created_at=lte.${end.toISOString()}&status=eq.completed&order=created_at.asc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch analytics');
      const orders: OrderData[] = await response.json();

      // Calculate analytics (only from completed orders)
      const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Top products
      const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
      orders.forEach(order => {
        order.order_items.forEach(item => {
          const existing = productMap.get(item.product_id);
          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += item.price_at_time * item.quantity;
          } else {
            productMap.set(item.product_id, {
              name: item.products.name,
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
      orders.forEach(order => {
        const date = formatDate(order.created_at);
        salesMap.set(date, (salesMap.get(date) || 0) + order.total_amount);
      });

      const salesByDay = Array.from(salesMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .slice(-7); // Last 7 days

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
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
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setPeriod('custom')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === 'custom'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar size={16} className="inline mr-1" />
            Custom
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} />
            <span className="text-sm opacity-90">Total Sales</span>
          </div>
          <p className="text-2xl font-bold">${analytics.totalSales.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl p-4 text-white">
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
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
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
                <p className="font-bold text-primary-600">
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