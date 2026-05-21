export type UserRole = 'STUDENT' | 'VENDOR';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface BuyerProfile {
  id: string;
  name: string;
  email?: string;
  role: 'STUDENT' | 'VENDOR';
  student_id?: string;
  dietary_prefs: string[];
  allergies: string[];
  budget_range: string;
  phone?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  cached?: boolean;
}

export type Profile = BuyerProfile;

export interface Stall {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  is_open: boolean;
  rating: number;
  total_ratings: number;
  owner_id: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  stall_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  ingredients: string[];
  allergens: string[];
  is_available: boolean;
  popularity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  stall_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  special_notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface Evaluation {
  id: string;
  user_id: string;
  order_id: string;
  functionality: number;
  usability: number;
  reliability: number;
  performance: number;
  overall_rating: number;
  comments: string;
  created_at: string;
}
