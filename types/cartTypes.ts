
import { ProductVariant, Product, Size, Color } from '../lib/generated/prisma'; 


export type CleanProductVariant = Omit<ProductVariant, 'createdAt' | 'updatedAt' | 'productId' | 'sizeId' | 'sku'>;

export type CartProductVariant = CleanProductVariant & {

  product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'salePrice' | 'isLimitedEdition'> & {
    images: { url: string; altText: string }[];
  };
  size: Pick<Size, 'id' | 'name'>;
  color: Pick<Color, 'id' | 'name'>;
};

export interface CartItem {
  productVariant: CartProductVariant;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}
