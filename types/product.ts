
export type ProductImage = {
  id: string;
  url: string;
  altText: string | null; 
  productId: string; 
  createdAt: Date;
  updatedAt: Date;
};


export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  isLimitedEdition: boolean; 
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null; 
  images: ProductImage[];
  variants?: any[]; // Simplified for now, could be ProductVariant[] later
};

// If you have a separate type for the props passed to the Card component,
// you might define it like this, reusing the Product type:
export type CardProps = {
  productData: Product; 

};
