import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Loader, Eye, Ban, CheckCircle } from 'lucide-react';
import CustomerDetailModal from './CustomerDetailModal';

export default function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Customers fetch cheyyanulla function
  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Customerine block/unblock cheyyan
  const toggleBlockStatus = async (id, currentStatus) => {
    try {
      await api.put(`/customers/${id}/block`);
      toast.success(`Customer ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
      fetchCustomers(); // Update data
    } catch (err) {
      toast.error('Failed to change block status');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-widest">Customers</h2>
      </div>

      <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-4 border-black bg-gray-100">
              <th className="p-4 font-black uppercase tracking-widest">Name</th>
              <th className="p-4 font-black uppercase tracking-widest">Email</th>
              <th className="p-4 font-black uppercase tracking-widest">Orders</th>
              <th className="p-4 font-black uppercase tracking-widest">Total Spent</th>
              <th className="p-4 font-black uppercase tracking-widest">Status</th>
              <th className="p-4 font-black uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center font-bold text-gray-500 uppercase tracking-widest border-b-4 border-black">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id} className="border-b-4 border-black hover:bg-yellow-50 transition-colors">
                  <td className="p-4 font-bold">{customer.name}</td>
                  <td className="p-4">{customer.email}</td>
                  <td className="p-4 font-bold">{customer.totalOrders || 0}</td>
                  <td className="p-4 font-mono font-bold">${(customer.totalSpent || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 font-black uppercase text-xs border-2 border-black ${customer.isBlocked ? 'bg-red-400 text-white' : 'bg-green-400 text-black'}`}>
                      {customer.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setSelectedCustomer(customer)}
                      className="bg-blue-300 border-2 border-black p-2 hover:bg-blue-400 hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => toggleBlockStatus(customer._id, customer.isBlocked)}
                      className={`border-2 border-black p-2 hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${customer.isBlocked ? 'bg-green-300 hover:bg-green-400' : 'bg-red-300 hover:bg-red-400'}`}
                      title={customer.isBlocked ? 'Unblock' : 'Block'}
                    >
                      {customer.isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer detail modal kanikkan */}
      {selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </div>
  );
}
