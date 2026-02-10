export type UserRole = 'driver' | 'shipper' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  country_code: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  unit: string;
  quantity: number;
}

export interface Receiver {
  name: string;
  phone: string;
  address: string;
}

export interface Load {
  id: string;
  owner_id: string;
  // تفاصيل الشحنة الأساسية
  type: string; // بضائع عامة، مواد غذائية...
  package_type: string; // كرتون، شوال...
  
  origin: string;
  destination: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  
  pickupDate: string;
  
  // المنتجات والمستلم
  products: Product[];
  receiver: Receiver;
  
  distance: number;
  estimatedTime: string;
  weight: number;
  price: number;
  
  truck_type_required: string;
  status: LoadStatus;
  created_at: string;
  
  profiles?: {
    full_name: string;
    phone: string;
    country_code: string;
  };
}

export type LoadStatus = 'available' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

// ... (Rest of types: TruckType, TrailerType, etc. remain the same)
