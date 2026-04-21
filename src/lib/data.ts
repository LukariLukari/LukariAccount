export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  billingCycle: string;
  rating: number;
  downloads: string;
  image: string;
  category: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  plans?: any;
  createdAt?: string;
  updatedAt?: string;
}

// Hardcoded products removed. Use Database.
export const products: Product[] = []; 
