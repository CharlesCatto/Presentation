export interface MarkerDetails {
  eventType: "voiture" | "moto" | "event";
  date: string;
  brand?: string;
  model?: string;
  year?: number;
  eventCategory?: string;
  duration?: string;
  address?: string;
  isSingleDay?: boolean; // special pour Map.tsx
}

export interface Marker {
  id: number;
  lat: number; // ✅ Use separate lat and lng properties
  lng: number;
  coord: Array<number>;
  label?: string;
  details?: MarkerDetails;
  user_id: number;
}
