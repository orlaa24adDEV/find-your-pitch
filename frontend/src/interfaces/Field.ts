export interface Field {
  id: number;
  name: string;
  description: string;
  location: string;
  sport: string;
  priceHour: number;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  updatedAt: string;
}
