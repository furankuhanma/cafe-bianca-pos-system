import { useState } from 'react';
import { ShoppingCart, ChevronUp } from 'lucide-react';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import type { CartItemData } from './CartItem';

interface CartProps {
  items: CartItemData[];
  notes: string;
  onNotesChange: (notes: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOrderNow: () => void;
  itemCount: number;
}

export function Cart({
  items,
  notes,
  onNotesChange,
  onQuantityChange,
  onRemoveItem,
  onOrderNow,
  itemCount,
}: CartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Mobile Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-accent-500 hover:bg-accent-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 animate-bounce"
      >
        <ShoppingCart size={24} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Mobile Cart Drawer */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart size={24} className="text-primary-600" />
                Cart
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <ChevronUp size={24} />
              </button>
            </div>

            <div className="p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add items to get started!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onQuantityChange={(qty) => onQuantityChange(item.id, qty)}
                        onRemove={() => onRemoveItem(item.id)}
                      />
                    ))}
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => onNotesChange(e.target.value)}
                      placeholder="Cepat ya bestie! Any special instructions..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-600 focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  <CartSummary subtotal={subtotal} />

                  <button
                    onClick={() => {
                      onOrderNow();
                      setIsOpen(false);
                    }}
                    className="w-full mt-6 bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    Order Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Cart Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-96 bg-secondary-100 rounded-xl p-6 h-fit sticky top-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingCart size={24} className="text-primary-600" />
          Cart {itemCount > 0 && `(${itemCount})`}
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">
              Add items to get started!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={(qty) => onQuantityChange(item.id, qty)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Cepat ya bestie! Any special instructions..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-600 focus:outline-none resize-none bg-white"
                rows={3}
              />
            </div>

            <CartSummary subtotal={subtotal} />

            <button
              onClick={onOrderNow}
              className="w-full mt-6 bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              Order Now
            </button>
          </>
        )}
      </div>
    </>
  );
}