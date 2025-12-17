// src/App.tsx
import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { POSView } from './pages/POSView';
import { OrderHistory } from './components/orders/OrdersView';
import { Analytics } from './components/analytics/AnalyticsView';

type ViewType = 'pos' | 'orders' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('pos');

  // This function decides what to show in the main area
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