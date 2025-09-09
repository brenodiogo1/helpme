export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
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
}