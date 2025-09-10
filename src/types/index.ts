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
  cleaner_id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_price: number;
  status: 'pending_offer' | 'accepted' | 'rejected' | 'executing' | 'completed' | 'cancelled';
  created_at: string; // Adicionado
  updated_at: string; // Adicionado
  cleaners: { // Ajustado para um único objeto ou null
    name: string;
    photo_url?: string; // Usar photo_url para corresponder ao Supabase
  } | null;
  profiles?: { // Ajustado para um único objeto ou null
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
  updated_at: string; // Adicionado
  bookings: { // Ajustado para um único objeto ou null
    id: string;
    customer_id: string;
    booking_date: string;
    booking_time: string;
    duration_hours: number;
    total_price: number;
    status: string;
    profiles: { // Ajustado para um único objeto ou null
      first_name: string;
      last_name: string;
    } | null;
  };
}