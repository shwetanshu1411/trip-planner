export interface TripRequest {
  destination: string;
  days: number;
  budget: 'cheap' | 'moderate' | 'luxury';
  travelers: 'solo' | 'couple' | 'family' | 'friends';
}

export interface Place {
  name: string;
  description: string;
  geo: {
    lat: number;
    lng: number;
  };
  timeToSpend: string;
  category: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  places: Place[];
}

export interface TripItinerary {
  id?: string;
  destination: string;
  days: number;
  budget: string;
  travelers: string;
  itinerary: DayPlan[];
  createdAt: number;
  userId: string;
}
