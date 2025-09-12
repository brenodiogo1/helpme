export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatarUrl?: string;
}

export interface Schoonmaker {
  id: string;
  name: string;
  photoUrl: string;
  ratingAvg: number;
  ratingCount: number;
  hourlyRate: number;
  bio: string;
  services: string[];
  city: string;
  address: string;
  postcode: string;
  phoneNumber: string;
  reviews?: Review[];
  availableDaysOfWeek?: string[];
  unavailableDates?: string[];
}

// New Booking interface based on the provided schema
export type BookingStatus = 'draft' | 'pending_payment' | 'paid' | 'cancelled';

export interface Booking {
  id: string;
  customer_id: string | null; // Can be null for anonymous bookings
  service_id: number | null;
  frequency_code: 'once' | 'weekly' | 'biweekly' | null;
  home_size_m2: number | null;
  duration_hours: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  allow_alt_weekday: boolean;
  postcode: string | null;
  city: string | null;
  base_hourly_rate: number;
  discount: number;
  service_fee: number;
  addons_total: number;
  estimated_total: number;
  status: BookingStatus;
  created_at: string;
  // No cleaner_id, profiles, or cleaners directly in this new Booking interface
  // These would be fetched separately if needed, or the schema would need to be extended.
}