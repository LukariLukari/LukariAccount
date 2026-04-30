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
  isHidden?: boolean;
  isSoldOut?: boolean;
  plans?: any;
  details?: string | null;
  features?: any;
  instructions?: any;
  warranty?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Hardcoded products removed. Use Database.
export const products: Product[] = []; 
