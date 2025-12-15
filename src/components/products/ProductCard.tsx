import { Plus, Minus } from 'lucide-react';
import type { Product } from '../../lib/types';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddClick: () => void;
  onQuantityChange: (quantity: number) => void;
}

export function ProductCard({
  product,
  quantity,
  onAddClick,
  onQuantityChange,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group animate-fadeIn">
      <div className="relative overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 mb-3">{product.description}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {quantity === 0 ? (
          <button
            onClick={onAddClick}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md active:scale-95"
          >
            <Plus size={18} />
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-secondary-100 rounded-lg p-2">
            <button
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              className="text-primary-600 hover:text-primary-700 p-1 rounded transition-colors"
            >
              <Minus size={18} />
            </button>
            <span className="font-semibold text-gray-800 w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="text-primary-600 hover:text-primary-700 p-1 rounded transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
