import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import MetricsCards from '../components/MetricsCards';
import ProductsTab from '../components/ProductsTab';
import OrdersTab from '../components/OrdersTab';
import SettingsTab from '../components/SettingsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import CustomersTab from '../components/CustomersTab';
import useSocket from '../hooks/useSocket';
import CouponsTab from '../components/CouponsTab';
import ProfileModal from '../components/ProfileModal';
import { ExternalLink, Loader, ArrowRight, Store } from 'lucide-react';

const CATEGORIES = ['Apparel', 'Electronics', 'Goods', 'Clothing', 'Food', 'Sports', 'General Retail'];

export default function DashboardPage() {
  // Auth context-il ninnu user data edukkunnu
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Store data, tab state, modal visibility okke manage cheyyunnu
  const [store, setStore] = useState(null);
  useSocket(store?.storeSlug);
  const [activeTab, setActiveTab] = useState('Analytics');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Onboarding Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [onboardForm, setOnboardForm] = useState({
    storeName: '', category: CATEGORIES[0], whatsappNumber: '', heroBgUrl: '', themeColor: '#000000'
  });
  const [onboardLoading, setOnboardLoading] = useState(false);

  useEffect(() => {
    // Store details backend-il ninnu fetch cheyyunnu
    const fetchStore = async () => {
      try {
        const res = await api.get('/tenant/my-store');
        if (res.data) {
          setStore(res.data);
          api.defaults.headers.common['x-tenant-id'] = res.data.storeSlug;
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          toast.error('Failed to load store information');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    // Step 1 validation: Store name koduthittillel error kanikkum
    if (wizardStep === 1) {
      if (!onboardForm.storeName) return toast.error('Store name is required');
      setWizardStep(2);
      return;
    }
    
    if (!onboardForm.whatsappNumber) return toast.error('WhatsApp number is required');
    
    try {
      setOnboardLoading(true);
      // Pudiya store create cheyyan api call cheyyunnu
      const res = await api.post('/tenant/store', onboardForm);
      setStore(res.data);
      api.defaults.headers.common['x-tenant-id'] = res.data.storeSlug;
      toast.success('Store created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally {
      setOnboardLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader className="animate-spin text-black" size={48} /></div>;
  }

  // Onboarding Wizard UI
  if (!store) {
    return (
      <div className="min-h-screen bg-yellow-300 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-full mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
              <Store size={32} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-widest">Create Your Store</h1>
            <p className="font-bold text-gray-500 mt-2">Step {wizardStep} of 2</p>
          </div>

          <form onSubmit={handleOnboardSubmit} className="space-y-6">
            {wizardStep === 1 ? (
              <div className="space-y-6 animate-[slideInRight_0.3s_ease-out]">
                <div>
                  <label className="block font-black uppercase tracking-widest mb-2">Store Name</label>
                  <input type="text" autoFocus required placeholder="e.g. My Awesome Shop" className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all" value={onboardForm.storeName} onChange={(e) => setOnboardForm({...onboardForm, storeName: e.target.value})} />
                </div>
                <div>
                  <label className="block font-black uppercase tracking-widest mb-2">Category</label>
                  <select className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all cursor-pointer" value={onboardForm.category} onChange={(e) => setOnboardForm({...onboardForm, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xl hover:bg-gray-800 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] flex justify-center items-center gap-3 mt-8">
                  Next Step <ArrowRight size={24} />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-[slideInRight_0.3s_ease-out]">
                <div>
                  <label className="block font-black uppercase tracking-widest mb-2">WhatsApp Number</label>
                  <input type="text" required placeholder="+1234567890" className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-blue-300" value={onboardForm.whatsappNumber} onChange={(e) => setOnboardForm({...onboardForm, whatsappNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block font-black uppercase tracking-widest mb-2">Theme Color</label>
                  <div className="flex items-center gap-4">
                    <input type="color" className="w-16 h-16 border-4 border-black cursor-pointer p-1" value={onboardForm.themeColor} onChange={(e) => setOnboardForm({...onboardForm, themeColor: e.target.value})} />
                    <span className="font-mono font-bold uppercase text-lg">{onboardForm.themeColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block font-black uppercase tracking-widest mb-2">Hero Background URL (Optional)</label>
                  <input type="url" placeholder="https://..." className="w-full border-4 border-black p-4 font-bold focus:outline-none focus:ring-4 focus:ring-blue-300" value={onboardForm.heroBgUrl} onChange={(e) => setOnboardForm({...onboardForm, heroBgUrl: e.target.value})} />
                </div>
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setWizardStep(1)} className="flex-1 py-4 border-4 border-black font-black uppercase tracking-widest text-lg hover:bg-gray-100 transition-all">Back</button>
                  <button type="submit" disabled={onboardLoading} className="flex-[2] py-4 bg-black text-white font-black uppercase tracking-widest text-lg hover:bg-gray-800 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] disabled:opacity-50 flex justify-center items-center gap-3">
                    {onboardLoading ? <Loader className="animate-spin" size={24} /> : 'Launch Store'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard UI
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-black">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="pt-20 md:pt-0 bg-white border-b-4 border-black p-4 md:p-6 flex justify-between items-center z-10 shrink-0 shadow-[0_4px_0_0_rgba(0,0,0,1)] relative">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest">{activeTab}</h2>
            <p className="text-sm font-bold text-gray-500 hidden sm:block">Managing {store.storeName}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowProfileModal(true)} className="hidden sm:block font-bold uppercase text-sm border-2 border-black px-4 py-2 hover:bg-gray-100 transition-colors">Profile</button>
            <a 
              href={import.meta.env.PROD ? `https://${store.storeSlug}.yourdomain.com` : `http://${store.storeSlug}.localhost:3001`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-400 border-2 border-black px-4 py-2 font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="hidden sm:inline">Live Store</span> <ExternalLink size={16} />
            </a>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'Analytics' && <AnalyticsTab />}
            {activeTab === 'Products' && <ProductsTab />}
            {activeTab === 'Orders' && <OrdersTab />}
            {activeTab === 'Coupons' && <CouponsTab />}
            {/* Customers tab render cheyyunnu */}
            {activeTab === 'Customers' && <CustomersTab />}
            {activeTab === 'Settings' && <SettingsTab store={store} />}
          </div>
        </div>
      </main>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
}
