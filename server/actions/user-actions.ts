"use server";

import { updateUserDetailsAction } from "@/server/db-actions/prisma";
import { revalidatePath } from "next/cache";

interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  phone: string | null;
  name: string | null;
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
