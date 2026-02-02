// Custom type definitions for Apex Reserve

export type AppRole = 'superadmin' | 'managing_director' | 'hr_office' | 'club_house_manager' | 'employee' | 'third_party';

export type ApprovalStatus = 'pending' | 'approved' | 'declined';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type MealType = 'breakfast' | 'lunch' | 'supper';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  avatar_url?: string;
  dietary_preferences?: string[];
  allergies?: string[];
  is_third_party: boolean;
  account_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by?: string;
  created_at: string;
}

export interface Accommodation {
  id: string;
  name: string;
  description?: string;
  room_type: string;
  capacity: number;
  amenities?: string[];
  images?: string[];
  price_per_night: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccommodationBooking {
  id: string;
  user_id: string;
  accommodation_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  special_requests?: string;
  status: ApprovalStatus;
  department_approval: ApprovalStatus;
  hr_approval: ApprovalStatus;
  md_approval?: ApprovalStatus;
  approved_by?: string;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
  accommodation?: Accommodation;
  profile?: Profile;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  meal_type: MealType;
  price: number;
  image_url?: string;
  available_from?: string;
  available_until?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergens?: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoodOrder {
  id: string;
  user_id: string;
  order_date: string;
  delivery_time: string;
  meal_type: MealType;
  total_amount: number;
  special_requests?: string;
  status: OrderStatus;
  admin_approval: ApprovalStatus;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  items?: FoodOrderItem[];
  profile?: Profile;
}

export interface FoodOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
  created_at: string;
  menu_item?: MenuItem;
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
  facility_type: string;
  capacity?: number;
  amenities?: string[];
  images?: string[];
  hourly_rate: number;
  requires_approval: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacilityBooking {
  id: string;
  user_id: string;
  facility_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  attendees: number;
  status: ApprovalStatus;
  club_manager_approval: ApprovalStatus;
  approved_by?: string;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
  facility?: Facility;
  profile?: Profile;
}

export interface AccommodationRequest {
  id: string;
  user_id: string;
  guest_name: string;
  guest_address: string;
  check_in_date: string;
  check_in_time?: string;
  check_out_date: string;
  check_out_time?: string;
  purpose_of_visit: string;
  guests: number;
  billing_to: 'guest' | 'department';
  room_type_preference?: string;
  special_requests?: string;
  status: ApprovalStatus;
  assigned_accommodation_id?: string;
  approved_by?: string;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  assigned_accommodation?: Accommodation;
}

export interface FacilityRequest {
  id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  facility_type_preference?: string;
  purpose?: string;
  attendees: number;
  status: ApprovalStatus;
  assigned_facility_id?: string;
  approved_by?: string;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  assigned_facility?: Facility;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: 'Super Admin (IT)',
  managing_director: 'Managing Director',
  hr_office: 'HR Office',
  club_house_manager: 'Club House Manager',
  employee: 'Employee',
  third_party: 'Third Party',
};

export const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  supper: 'Supper',
};
