export interface Product {
  id: string;
  name: string;
  origin: string;
  fat: string;
  price_per_100g: number;
  currency: string;
  aging: string;
  description: string;
  labelKeywords: string[];
  image?: string;
}
