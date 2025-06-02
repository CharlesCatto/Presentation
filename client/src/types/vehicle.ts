export type VehicleData = {
  id: number;
  vehicle_picture?: string | null;
  type: "type" | "voiture" | "moto";
  status: "indisponible" | "vente" | "essai";
  location: string;
  coord: Array<number>;
  energy: "essence" | "diesel" | "electrique";
  user_id: number;
  year: number;
  brand: string;
  model: string;
};
