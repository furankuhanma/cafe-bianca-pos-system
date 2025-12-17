// src/pages/POSView.tsx
import { useState } from 'react';
import { ShoppingCart, Search, X, Minus, Plus, Trash2, Wallet, Smartphone } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';


export function POSView() {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    items,
    notes,
    addItem,
    removeItem,
    updateQuantity,
    setNotes,
    clearCart,
    totalAmount,
    totalItems,
  } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOrderNow = async () => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_amount: totalAmount,
          status: 'pending',
          payment_method: paymentMethod,
          customer_name: notes || null,
        })
        .select()
        .maybeSingle();

      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
      }, 3000);

      clearCart();
      setShowCart(false);
      setPaymentMethod('cash'); // Reset to default
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (productsError || categoriesError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {productsError || categoriesError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="font-bold text-gray-900">Cafe Bianca</h1>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Success Message */}
      {orderSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Order placed successfully!
        </div>
      )}

      {/* Categories */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => {
              const cartItem = items.find(i => i.id === product.id);
              const quantity = cartItem?.quantity || 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="aspect-square relative bg-gray-300">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        $ {product.price}
                      </span>
                      {quantity > 0 ? (
                        <div className="flex items-center gap-2 bg-gray-900 rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="text-white"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white text-sm font-medium min-w-[20px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image || '',
                            })
                          }
                          className="bg-gray-900 text-white rounded-full p-1.5"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-gray-900 text-white rounded-full p-4 shadow-2xl z-30 hover:bg-gray-800 transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-40" onClick={() => setShowCart(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Cart</h2>
                <button onClick={() => setShowCart(false)} className="p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 mb-4 pb-4 border-b border-gray-100 last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{item.name}</h4>
                    <p className="text-gray-900 font-semibold mb-2">$ {item.price}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium text-sm min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* Note Section */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cepat ya bestie!"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                  rows={2}
                />
              </div>

              {/* Payment Method Section */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Wallet className={`w-8 h-8 mb-2 ${paymentMethod === 'cash' ? 'text-gray-900' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${paymentMethod === 'cash' ? 'text-gray-900' : 'text-gray-600'}`}>
                      Cash
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('gcash')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'gcash'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className={`w-8 h-8 mb-2 ${paymentMethod === 'gcash' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${paymentMethod === 'gcash' ? 'text-blue-600' : 'text-gray-600'}`}>
                      GCash
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Footer */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-medium">${subtotal.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (20%)</span>
                  <span className="font-medium">${tax.toFixed(1)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">${total.toFixed(1)}</span>
                </div>
              </div>
              <button
                onClick={handleOrderNow}
                disabled={isSubmitting}
                className="w-full bg-gray-900 text-white py-3.5 rounded-full font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
              >
                {isSubmitting ? 'Processing...' : `Pay with ${paymentMethod === 'cash' ? 'Cash' : 'GCash'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}