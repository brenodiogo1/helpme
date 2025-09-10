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
  reviews?: Review[];
  availableDaysOfWeek?: string[]; // Novo campo: dias da semana disponíveis (ex: ["Monday", "Wednesday"])
  unavailableDates?: string[]; // Novo campo: datas específicas indisponíveis (formato ISO string)
}