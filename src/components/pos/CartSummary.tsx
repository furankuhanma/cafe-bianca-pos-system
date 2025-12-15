interface CartSummaryProps {
  subtotal: number;
  taxRate?: number;
}

export function CartSummary({ subtotal, taxRate = 0.2 }: CartSummaryProps) {
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="space-y-3 pt-4 border-t-2 border-gray-200">
      <div className="flex justify-between text-gray-600 text-sm">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-600 text-sm">
        <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <span className="font-bold text-gray-800">Total</span>
        <span className="text-2xl font-bold text-primary-600">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
