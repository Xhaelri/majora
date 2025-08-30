export interface BillingData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BuyNowItem {
  id?: string;
  productVariantId: string;
  quantity: number;
  productVariant?: ProductVariantWithProduct;
}

export interface CheckoutSessionResult {
  paymentKey?: string;
  orderId?: string;
  error?: string;
}

export interface AppliedDiscount {
  code: string;
  amount: number;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

export interface DiscountValidationResult {
  error?: string;
  discount?: AppliedDiscount;
}

export interface OrderItemData {
  productId: string;
  variantId: string;
  quantity: number;
  productSnapshot: {
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    price: number;
    salePrice: number | null;
    size: string;
    color: string;
    colorHex: string;
    images: string[];
  };
  priceAtPurchase: number;
}

export interface ProductVariantWithProduct {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    slug: string;
    price: number;
    salePrice: number | null;
    isLimitedEdition: boolean;
    isAvailable: boolean;
    categoryId: string | null;
  };
}
