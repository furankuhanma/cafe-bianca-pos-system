import { X, ShoppingBag, BarChart3 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'orders' | 'analytics';
  onTabChange: (tab: 'orders' | 'analytics') => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, onClose, activeTab, onTabChange, children }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => onTabChange('orders')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag size={20} />
            Orders
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={20} />
            Analytics
          </button>
        </div>

        {/* Content Area */}
        <div className="h-[calc(100vh-120px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}