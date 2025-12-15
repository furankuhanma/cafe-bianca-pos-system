export interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  description?: string;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string | null;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'gcash' | null;
  created_at: string;
  completed_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  notes: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  notes?: string;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product?: Product })[];
}
