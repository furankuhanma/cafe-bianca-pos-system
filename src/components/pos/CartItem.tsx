import { Minus, Plus, Trash2 } from 'lucide-react';

export interface CartItemData {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0 animate-slideUp">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
          {item.name}
        </h4>
        <p className="text-primary-600 font-bold text-sm mt-1">
          ${item.price.toFixed(2)}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
            className="text-gray-600 hover:text-primary-600 p-1 rounded transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="font-semibold text-gray-800 w-6 text-center text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.quantity + 1)}
            className="text-gray-600 hover:text-primary-600 p-1 rounded transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 size={18} />
        </button>
        <p className="text-primary-700 font-bold text-sm">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
