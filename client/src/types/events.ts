export type Eventdata = {
  id: number;
  title: string;
  event_picture?: string | null;
  type:
    | "type"
    | "salon"
    | "course"
    | "musée"
    | "vente aux enchères"
    | "roadtrip"
    | "rassemblement"
    | "autre";
  date_start: string | Date;
  date_end: string | Date;
  location: {
    x: number;
    y: number;
  };
  address: string;
  description: string;
  link?: string | null;
  user_id: number;
  creator_username?: string;
};
