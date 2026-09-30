import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import MetricsCards from './MetricsCards';

const PIE_COLORS = ['#fde047', '#93c5fd', '#d8b4fe', '#86efac', '#fca5a5'];

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader className="animate-spin" size={48} /></div>;
  }

  if (!data) return <div className="p-8 text-center font-bold">Failed to load analytics data.</div>;

  return (
    <div className="space-y-8">
      <MetricsCards analytics={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Over Time */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Revenue (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#000" tick={{fontFamily: 'monospace', fontSize: 12}} />
                <YAxis stroke="#000" tick={{fontFamily: 'monospace', fontSize: 12}} />
                <Tooltip contentStyle={{border: '4px solid #000', borderRadius: 0, fontWeight: 'bold'}} />
                <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={4} dot={{strokeWidth: 2, r: 4, fill: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Orders by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.orderStatusData || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count" nameKey="_id" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(data.orderStatusData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#000" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{border: '4px solid #000', borderRadius: 0, fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:col-span-2">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Top Selling Products</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts || []} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" stroke="#000" tick={{fontFamily: 'monospace', fontSize: 12}} />
                <YAxis dataKey="name" type="category" width={150} stroke="#000" tick={{fontFamily: 'monospace', fontSize: 12}} />
                <Tooltip contentStyle={{border: '4px solid #000', borderRadius: 0, fontWeight: 'bold'}} />
                <Bar dataKey="sold" fill="#60a5fa" stroke="#000" strokeWidth={2} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-2">
            <AlertTriangle className="text-red-500" />
            <h3 className="text-lg font-black uppercase tracking-widest text-red-600">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(!data.lowStockProducts || data.lowStockProducts.length === 0) ? (
              <p className="text-gray-500 font-bold text-center py-4">No low stock items.</p>
            ) : (
              data.lowStockProducts.map(p => (
                <div key={p._id} className="flex justify-between items-center p-3 border-2 border-black bg-red-50">
                  <span className="font-bold text-sm">{p.name}</span>
                  <span className="px-2 py-1 bg-red-600 text-white font-black text-xs">Left: {p.stock}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-black font-black uppercase text-gray-500">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(!data.recentOrders || data.recentOrders.length === 0) ? (
                  <tr><td colSpan="4" className="py-4 text-center font-bold text-gray-500">No recent orders</td></tr>
                ) : (
                  data.recentOrders.map(o => (
                    <tr key={o._id} className="border-b border-gray-200">
                      <td className="py-3 font-mono font-bold">{o._id.slice(-6).toUpperCase()}</td>
                      <td className="py-3 font-bold truncate max-w-[100px]">{o.customerName}</td>
                      <td className="py-3 font-black">${o.totalAmount?.toFixed(2)}</td>
                      <td className="py-3">
                        <span className="text-xs px-1 py-0.5 border border-black font-bold uppercase">{o.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
