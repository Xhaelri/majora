export interface ProductSnapshot {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  price: number;
  salePrice: number | null;
  categoryId: string | null;
  isAvailable: boolean;
  isLimitedEdition: boolean;
}

export interface VariantSnapshot {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
}

export interface BaseCartItem {
  quantity: number;
  productSnapshot: ProductSnapshot;
  variantSnapshot: VariantSnapshot;
}

export interface OrderItem extends BaseCartItem {
  productId: string;
  variantId: string;
  priceAtPurchase: number;
}

export interface CartItemUI {
  quantity: number;
  productId: string;
  variantId: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  price: number;
  salePrice: number | null;
  isLimitedEdition: boolean;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
}

export interface LocalCartItem {
  productVariantId: string;
  quantity: number;
}

export interface CartState {
  items: CartItemUI[];
  totalQuantity: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

export interface CartOperationResult {
  success: boolean;
  error?: string;
  updatedItems?: CartItemUI[];
}

export interface GetCartDataResult {
  items: CartItemUI[];
  count: number;
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

export function createProductSnapshot(product: {
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
}): ProductSnapshot {
  return {
    id: product.id,
    name: product.name,
    nameAr: product.nameAr,
    slug: product.slug,
    description: product.description,
    descriptionAr: product.descriptionAr,
    price: product.price,
    salePrice: product.salePrice,
    categoryId: product.categoryId,
    isAvailable: product.isAvailable,
    isLimitedEdition: product.isLimitedEdition,
  };
}

export function createVariantSnapshot(variant: {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
}): VariantSnapshot {
  return {
    id: variant.id,
    size: variant.size,
    color: variant.color,
    colorHex: variant.colorHex,
    stock: variant.stock,
    images: variant.images,
  };
}

export function createBaseCartItem(
  variant: ProductVariantWithProduct,
  quantity: number
): BaseCartItem {
  return {
    quantity,
    productSnapshot: createProductSnapshot(variant.product),
    variantSnapshot: createVariantSnapshot(variant),
  };
}

export function baseCartItemToUI(item: BaseCartItem): CartItemUI {
  return {
    quantity: item.quantity,
    productId: item.productSnapshot.id,
    variantId: item.variantSnapshot.id,
    name: item.productSnapshot.name,
    nameAr: item.productSnapshot.nameAr,
    slug: item.productSnapshot.slug,
    description: item.productSnapshot.description,
    descriptionAr: item.productSnapshot.descriptionAr,
    price: item.productSnapshot.price,
    salePrice: item.productSnapshot.salePrice,
    isLimitedEdition: item.productSnapshot.isLimitedEdition,
    size: item.variantSnapshot.size,
    color: item.variantSnapshot.color,
    colorHex: item.variantSnapshot.colorHex,
    stock: item.variantSnapshot.stock,
    images: item.variantSnapshot.images,
  };
}

export function baseCartItemToOrderItem(item: BaseCartItem): OrderItem {
  const priceAtPurchase =
    item.productSnapshot.salePrice ?? item.productSnapshot.price;

  return {
    ...item,
    productId: item.productSnapshot.id,
    variantId: item.variantSnapshot.id,
    priceAtPurchase,
  };
}

export function isBaseCartItemArray(value: any): value is BaseCartItem[] {
  if (!Array.isArray(value)) return false;

  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.quantity === "number" &&
      typeof item.productSnapshot === "object" &&
      typeof item.variantSnapshot === "object" &&
      typeof item.productSnapshot.id === "string" &&
      typeof item.variantSnapshot.id === "string"
  );
}

export function isOrderItemArray(value: any): value is OrderItem[] {
  if (!Array.isArray(value)) return false;

  return value.every(
    (item) =>
      isBaseCartItemArray([item]) &&
      typeof item.productId === "string" &&
      typeof item.variantId === "string" &&
      typeof item.priceAtPurchase === "number"
  );
}
