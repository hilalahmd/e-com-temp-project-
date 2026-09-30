import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import api from './api/axios';
import toast from 'react-hot-toast';
import ConfirmDialog from './components/ConfirmDialog';
import Pagination from './components/Pagination';
import { 
  Users, Store, DollarSign, Activity, 
  Search, ShieldAlert, Trash2, Power,
  Menu, X, LogOut, Loader
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Stores');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  const [deleteConfirm, setDeleteConfirm] = useState(null); // store ID to delete

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch platform stats
      const statsRes = await api.get('/admin/platform-stats');
      setStats(statsRes.data);

      if (activeTab === 'Stores') {
        const storesRes = await api.get(`/admin/stores?page=${page}&limit=10&search=${search}`);
        setStores(storesRes.data.stores);
        setPages(storesRes.data.pages);
      } else {
        const usersRes = await api.get(`/admin/users?page=${page}&limit=10&search=${search}`);
        setUsers(usersRes.data.users);
        setPages(usersRes.data.pages);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, page, search]);

  const handleToggleStoreStatus = async (storeId, currentStatus) => {
    try {
      await api.put(`/admin/stores/${storeId}/status`, { isActive: !currentStatus });
      toast.success(`Store ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update store status');
    }
  };

  const handleDeleteStore = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/admin/stores/${deleteConfirm}`);
      toast.success('Store deleted successfully');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete store');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const tabs = [
    { name: 'Stores', icon: Store },
    { name: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-black">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white p-4 flex justify-between items-center border-b-4 border-white">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500" />
          <h1 className="text-lg font-black uppercase tracking-widest">SuperAdmin</h1>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={24} /> : <Menu size={24} />}</button>
      </div>

      {/* Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-0 bottom-0 left-0 w-64 bg-black p-4 animate-[slideInRight_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            {/* Sidebar content repeated below */}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-black text-white flex flex-col z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 border-b-4 border-gray-800 flex items-center gap-3">
          <ShieldAlert className="text-red-500" size={32} />
          <h1 className="text-xl font-black uppercase tracking-widest leading-tight">Super<br/>Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.name} onClick={() => { setActiveTab(tab.name); setPage(1); setSearch(''); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab.name ? 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]' : 'text-gray-400 hover:text-white hover:bg-gray-900 border-2 border-transparent'}`}>
                <Icon size={20} /> {tab.name}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t-4 border-gray-800">
          <div className="mb-4 px-4 text-sm">
            <p className="font-bold">{user?.name}</p>
            <p className="text-gray-500 text-xs">{user?.email}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white border-2 border-red-400 hover:border-red-500 transition-all">
            <LogOut size={18} /> Exit System
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen pt-20 md:pt-0 overflow-x-hidden">
        <div className="p-4 md:p-8 flex-1">
          {/* Stats Section */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Total Tenants</p>
                    <p className="text-4xl font-black mt-2">{stats.totalStores}</p>
                  </div>
                  <div className="bg-blue-100 p-4 border-2 border-black"><Store size={24} /></div>
                </div>
              </div>
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Total Users</p>
                    <p className="text-4xl font-black mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-green-100 p-4 border-2 border-black"><Users size={24} /></div>
                </div>
              </div>
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Total Orders</p>
                    <p className="text-4xl font-black mt-2">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-yellow-100 p-4 border-2 border-black"><Activity size={24} /></div>
                </div>
              </div>
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Gross Vol.</p>
                    <p className="text-2xl font-black mt-2">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-100 p-4 border-2 border-black"><DollarSign size={24} /></div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-black uppercase tracking-widest border-b-4 border-black pb-1 inline-block">Manage {activeTab}</h2>
            <div className="relative w-full sm:w-80">
              <input 
                type="text" 
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                className="w-full border-4 border-black p-3 pl-12 font-bold focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
          </div>

          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b-4 border-black text-sm uppercase font-black tracking-widest">
                  {activeTab === 'Stores' ? (
                    <>
                      <th className="p-4">Store Details</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Stats</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-12 text-center"><Loader className="animate-spin mx-auto" size={32} /></td></tr>
                ) : (
                  activeTab === 'Stores' ? (
                    stores.length === 0 ? <tr><td colSpan="5" className="p-8 text-center font-bold">No stores found</td></tr> :
                    stores.map(store => (
                      <tr key={store._id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-black text-lg">{store.storeName}</div>
                          <a href={`http://localhost:3001?store=${store.storeSlug}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">{store.storeSlug}</a>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="font-bold">{store.owner?.name || 'Unknown'}</div>
                          <div className="text-gray-500 text-xs">{store.owner?.email}</div>
                        </td>
                        <td className="p-4 text-sm font-bold text-gray-600">
                          {store.category}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-black ${store.isActive ? 'bg-green-300' : 'bg-red-300'}`}>
                            {store.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleToggleStoreStatus(store._id, store.isActive)} className="p-2 border-2 border-black hover:bg-gray-200 transition-colors" title={store.isActive ? 'Suspend' : 'Activate'}>
                              <Power size={18} className={store.isActive ? 'text-red-500' : 'text-green-500'} />
                            </button>
                            <button onClick={() => setDeleteConfirm(store._id)} className="p-2 border-2 border-black bg-red-100 hover:bg-red-200 text-red-600 transition-colors" title="Delete Store">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    users.length === 0 ? <tr><td colSpan="4" className="p-8 text-center font-bold">No users found</td></tr> :
                    users.map(u => (
                      <tr key={u._id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                        <td className="p-4 font-bold">{u.name}</td>
                        <td className="p-4 font-mono text-sm">{u.email}</td>
                        <td className="p-4">
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={u._id === user?._id}
                            className={`p-2 border-2 border-black font-black uppercase text-xs focus:outline-none ${u.role === 'superadmin' ? 'bg-purple-200' : 'bg-white'}`}
                          >
                            <option value="user">User</option>
                            <option value="superadmin">SuperAdmin</option>
                          </select>
                        </td>
                        <td className="p-4 text-sm font-bold text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
          
          {!loading && <Pagination page={page} pages={pages} onPageChange={setPage} />}
        </div>
      </main>

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Store Permanently"
          message="Are you absolutely sure you want to delete this store and all its data? This cannot be undone."
          onConfirm={handleDeleteStore}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
