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
  phoneNumber: string;
  reviews?: Review[];
  availableDaysOfWeek?: string[];
  unavailableDates?: string[];
}

export interface Booking {
  id: string;
  customer_id: string;
  cleaner_id: string | null; // Permitir que cleaner_id seja nulo
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_price: number;
  status: 'pending_offer' | 'accepted' | 'rejected' | 'executing' | 'completed' | 'cancelled' | 'pending_assignment' | 'paid_pending_assignment'; // Adicionado 'paid_pending_assignment'
  created_at: string;
  updated_at: string;
  address?: string; // Novo campo
  postcode?: string; // Novo campo
  phone_number?: string; // Novo campo
  first_name?: string; // Novo campo
  last_name?: string; // Novo campo
  email?: string; // Novo campo
  cleaners: {
    name: string;
    photo_url?: string;
  } | null;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface JobOffer {
  id: string;
  booking_id: string;
  cleaner_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  bookings: {
    id: string;
    customer_id: string;
    booking_date: string;
    booking_time: string;
    duration_hours: number;
    total_price: number;
    status: string;
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}