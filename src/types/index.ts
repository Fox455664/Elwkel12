export type UserRole = 'driver' | 'shipper' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  country_code: string;
  created_at: string;
}

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  country_code: string;
  avatar?: string;
  role: UserRole;
  currentCity: string;
  rating: number;
  completedTrips: number;
  isAvailable: boolean;
  truckType?: TruckType;
  created_at: string;
  // تفاصيل إضافية من جدول driver_details
  driver_details?: {
    truck_type: TruckType;
    trailer_type: TrailerType;
    dimensions: TruckDimensions;
  }[];
}

export interface Load {
  id: string;
  owner_id: string;
  origin: string;
  destination: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  distance: number;
  estimatedTime: string;
  weight: number;
  description: string;
  price: number;
  truck_type_required: TruckType;
  status: LoadStatus;
  created_at: string;
  // بيانات المالك (Joined Data)
  profiles?: {
    full_name: string;
    phone: string;
    country_code: string;
  };
}

export type LoadStatus = 'available' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type TruckType = 
  | 'trella' 
  | 'lorry' 
  | 'dyna' 
  | 'pickup' 
  | 'refrigerated' 
  | 'tanker'
  | 'flatbed'
  | 'container'
  | 'unknown';

export type TrailerType = 
  | 'flatbed' 
  | 'curtain' 
  | 'box' 
  | 'refrigerated' 
  | 'lowboy' 
  | 'tank';

export type TruckDimensions = 
  | 'small' 
  | 'medium' 
  | 'large' 
  | 'extra_large';

export interface TruckTypeInfo {
  id: TruckType;
  nameAr: string;
  icon: string;
}

export interface TrailerTypeInfo {
  id: TrailerType;
  nameAr: string;
  icon: string;
}

export interface DimensionInfo {
  id: TruckDimensions;
  nameAr: string;
  specs: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalShippers: number;
  activeLoads: number;
  completedTrips: number;
}
