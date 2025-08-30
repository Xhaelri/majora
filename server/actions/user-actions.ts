// Fixed user-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { validate } from "uuid";

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
    firstName: formData.get("firstName")?.toString() || "",
    lastName: formData.get("lastName")?.toString() || "",
    address: formData.get("address")?.toString() || null,
    phone: formData.get("phone")?.toString() || null,
    email: formData.get("email")?.toString() || "",
  };

  // Email is required in schema
  if (!data.email) {
    return { error: "Email is required" };
  }

  // firstName and lastName are required in schema
  if (!data.firstName || !data.lastName) {
    return { error: "First name and last name are required" };
  }

  // Check if email is already in use by another user
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
        // Update name field to be consistent with firstName + lastName
        name: `${data.firstName} ${data.lastName}`.trim(),
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

// Updated interface to match Prisma return types
interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  phone: string | null;
  name: string | null;
  orders?: {
    id: string;
    status: string;
    orderDate: Date;
    subtotal: number;
    discountAmount: number | null;
    shippingCost: number;
    totalAmount: number;
    billingState: string | null;
    billingCity: string | null;
    billingBuilding: string | null;
    billingFloor: string | null;
    billingStreet: string | null;
    paymentProvider: string | null;
    items: any; // JsonValue from Prisma
  }[];
}

type ActionState = {
  success: string | null;
  error: string | null;
  data: UserData | null;
};

export async function updateUserAction(
  userId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const result = await updateUserDetailsAction(userId, formData);

    if (result.error) {
      return {
        success: null,
        error: result.error,
        data: null,
      };
    }

    revalidatePath("/account");

    return {
      success: "Profile updated successfully!",
      error: null,
      data: result.data || null,
    };
  } catch (error) {
    console.error("Error in updateUserAction:", error);
    return {
      success: null,
      error: "An unexpected error occurred. Please try again.",
      data: null,
    };
  }
}

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
          paymentProvider: true,
          items: true
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