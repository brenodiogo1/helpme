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
  user_id?: string; // Adicionado user_id
  name: string;
  photo_url?: string; // Alterado para photo_url
  rating_avg: number; // Alterado para rating_avg
  rating_count: number; // Alterado para rating_count
  hourly_rate: number; // Alterado para hourly_rate
  bio: string;
  services?: string[]; // Alterado para services (array de strings)
  city: string;
  address: string;
  postcode?: string; // Adicionado postcode
  phone_number: string; // Alterado para phone_number
  reviews?: Review[];
  available_days_of_week?: string[]; // Alterado para available_days_of_week
  unavailable_dates?: string[]; // Alterado para unavailable_dates
  can_work_in_nl?: boolean; // Adicionado
  has_residence_permit_or_eu?: boolean; // Adicionado
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