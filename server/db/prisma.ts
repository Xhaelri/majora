
import { db } from "@/lib/prisma";
import { FullProduct } from "@/types/product";

export const getAllProducts = async () => {
  try {
    const products: FullProduct[] = await db.product.findMany({
      include: {
        category: true,
        variants: {
          include: {
            size: true,
            color: true,
            images: true,
            product: true,
          },
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
};

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: true,
      variants: {
        include: {
          size: true,
          color: true,
          images: true,
          product: true,
        },
      },
    },
  });
}

// Get products by category
export async function getProductsByCategory(categorySlug: string) {
  try {
    const products = await db.product.findMany({
      where: {
        category: {
          name: {
            equals: categorySlug,
            mode: "insensitive",
          },
        },
      },
      include: {
        category: true,
        variants: {
          include: {
            size: true,
            color: true,
            images: true,
            product: true,
          },
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

// Sorting products
export type SortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-desc"
  | "date-asc";

export async function getSortedProducts(sort: SortOption) {
  let orderBy: Array<Record<string, "asc" | "desc">> = [];

  switch (sort) {
    case "name-asc":
      orderBy = [{ name: "asc" }];
      break;
    case "name-desc":
      orderBy = [{ name: "desc" }];
      break;
    case "price-asc":
      orderBy = [{ price: "asc" }];
      break;
    case "price-desc":
      orderBy = [{ price: "desc" }];
      break;
    case "date-desc":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "date-asc":
      orderBy = [{ createdAt: "asc" }];
      break;
    case "featured":
      orderBy = [{ isLimitedEdition: "desc" }, { createdAt: "desc" }];
      break;
    default:
      orderBy = [{ createdAt: "desc" }];
      break;
  }

  const products = await db.product.findMany({
    orderBy,
    include: {
      category: true,
      variants: {
        include: {
          size: true,
          color: true,
          images: true,
          product: true,
        },
      },
    },
  });

  return products;
}

// Helper function to get category by slug
export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: {
      name: {
        equals: slug,
        mode: "insensitive",
      },
    },
  });
}


export async function getAllProductSlugs() {
  const products = await db.product.findMany({
    select: { slug: true },
  });
  return products.map((product) => product.slug);
}

export async function getAllcategories() {
  const categories = await db.product.findMany({
    select: { name: true },
  });
  return categories.map((category) => category.name);
}

import { validate } from "uuid";

export async function getAccountDetails(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  if (!validate(userId)) {
    throw new Error("Invalid user ID format");
  }

  const userData = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      address: true,
      phone: true,
      name: true,
      orders: {
        select: {
          id: true,
          status: true,
          orderDate: true,
          subtotal: true,
          discountAmount: true,
          shippingCost: true,
          totalAmount: true,
          billingState: true,
          billingCity: true,
          billingBuilding: true,
          billingFloor: true,
          billingStreet: true,
          paymentMethod: true,
          paymentProvider: true,
          orderItems: {
            select: {
              id: true,
              productVariantId: true,
              quantity: true,
              priceAtPurchase: true,
              productVariant: {
                select: {
                  product: {
                    select: {
                      name: true,
                    },
                  },
                  size: {
                    select: {
                      name: true,
                    },
                  },
                  color: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        take: 10,
        orderBy: { orderDate: "desc" },
      },
    },
  });

  if (!userData) {
    throw new Error("User not found");
  }

  return userData;
}

export async function updateUserDetailsAction(
  userId: string,
  formData: FormData
) {
  if (!userId) {
    return { error: "User ID is required" };
  }
  if (!validate(userId)) {
    return { error: "Invalid user ID format" };
  }

  const data = {
    firstName: formData.get("firstName")?.toString() || null,
    lastName: formData.get("lastName")?.toString() || null,
    address: formData.get("address")?.toString() || null,
    phone: formData.get("phone")?.toString() || null,
    email: formData.get("email")?.toString() || null,
  };

  if (data.email) {
    const existingUser = await db.user.findFirst({
      where: { email: data.email, NOT: { id: userId } },
    });
    if (existingUser) {
      return { error: "Email is already in use" };
    }
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        updatedAt: new Date(),
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        address: true,
        phone: true,
        name: true,
      },
    });

    return { data: updatedUser, error: null };
  } catch (error) {
    console.error("Error updating user details:", error);
    return { error: "Failed to update profile" };
  }
}
