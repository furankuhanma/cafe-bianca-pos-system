import { CartProvider } from './context/CartContext';
import { POSView } from './pages/POSView';

function App() {
  return (
    <CartProvider>
      <POSView />
    </CartProvider>
  );
}

export default App;