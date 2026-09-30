import { Package, ShoppingCart, DollarSign, Clock } from 'lucide-react';

export default function MetricsCards({ analytics }) {
  const cards = [
    { label: 'Live Products', value: analytics?.totalProducts ?? 0, icon: Package, color: 'bg-blue-100' },
    { label: 'Total Orders', value: analytics?.totalOrders ?? 0, icon: ShoppingCart, color: 'bg-green-100' },
    { label: 'Gross Revenue', value: `$${(analytics?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-100' },
    { label: 'Pending Orders', value: analytics?.pendingOrders ?? 0, icon: Clock, color: 'bg-red-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{card.label}</p>
                <p className="text-3xl font-black mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3`}>
                <Icon size={24} className="text-black" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
