import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Settings, BarChart3, LogOut, User, Menu, X, Ticket, Users } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Products', icon: Package },
    { name: 'Orders', icon: ShoppingCart },
    { name: 'Coupons', icon: Ticket },
    // Customers tab add cheyyanulla entry
    { name: 'Customers', icon: Users },
    { name: 'Settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-black uppercase tracking-widest">Store Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.name}
              onClick={() => { setActiveTab(tab.name); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.name
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <Icon size={18} />
              {tab.name}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <User size={18} className="text-gray-400" />
          <div className="text-sm">
            <p className="font-bold text-white">{user?.name || 'User'}</p>
            <p className="text-gray-500 text-xs">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-gray-900 transition-all mt-2"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white p-4 flex items-center justify-between border-b-2 border-white">
        <h1 className="text-lg font-black uppercase tracking-widest">Store Admin</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-black text-white z-50 animate-[slideInRight_0.3s_ease-out]">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-black text-white flex-col flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
