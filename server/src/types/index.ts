export interface MarkerDetails {
  eventType: "car" | "motorcycle" | "event";
  date: string;
  brand?: string;
  model?: string;
  year?: number;
  eventCategory?: string;
  duration?: string;
  isSingleDay?: boolean; // special pour Map.tsx
}

export interface Marker {
  id: number;
  lat: number; // ✅ Use separate lat and lng properties
  lng: number;
  label?: string;
  details?: MarkerDetails;
  user_id: number;
}
