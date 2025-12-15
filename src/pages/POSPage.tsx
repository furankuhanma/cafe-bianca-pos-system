import { CartProvider } from '../context/CartContext';
import { POSView } from './POSView';

export function POSPage() {
  return (
    <CartProvider>
      <POSView />
    </CartProvider>
  );
}
