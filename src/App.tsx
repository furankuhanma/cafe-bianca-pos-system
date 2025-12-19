import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { POSView } from './pages/POSView';
import { OrderHistory } from './components/orders/OrdersView';
import { Analytics } from './components/analytics/AnalyticsView';
import { ManageView } from './components/manage/ManageView';

type ViewType = 'pos' | 'orders' | 'analytics' | 'manage';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('pos');

  const renderContent = () => {
    switch (currentView) {
      case 'pos':
        return <POSView />;
      case 'orders':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            <OrderHistory />
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>
            <Analytics />
          </div>
        );
      case 'manage':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Manage Inventory</h2>
            <ManageView />
          </div>
        );
      default:
        return <POSView />;
    }
  };

  return (
    <CartProvider>
      <DashboardLayout 
        currentView={currentView} 
        onViewChange={setCurrentView}
      >
        {renderContent()}
      </DashboardLayout>
    </CartProvider>
  );
}

export default App;