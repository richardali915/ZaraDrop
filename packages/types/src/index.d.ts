export type UserRole = 'customer' | 'rider' | 'store' | 'admin';

export interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_code?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'assigned' | 'delivering' | 'delivered' | 'cancelled' | 'accepted' | 'declined';
  total: number;
  payment_method: 'wallet' | 'cash' | 'card' | string;
  payment_status?: 'paid' | 'pending' | 'failed' | string;
  customer_id?: string;
  rider_id?: string | null;
  store_id?: string;
  destination?: string;
  eta?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface ApprovalItem {
  id: string;
  type: 'merchant' | 'rider' | 'order';
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  requested: string;
  details?: string;
}
