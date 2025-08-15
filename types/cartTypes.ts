import { CartItemWithProduct } from "@/lib/cart-utils";

export type CartItem = CartItemWithProduct;

export interface LocalCartItem {
  productVariantId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

export interface CartActionResult {
  success: boolean;
  error?: string;
  updatedItems?: CartItem[];
}

export interface getCartDataForAuthUserResult {
  items: CartItem[];
  count: number;
}

export interface DiscountResult {
  success?: string;
  error?: string;
  discountAmount?: number;
  discountCode?: string;
}
