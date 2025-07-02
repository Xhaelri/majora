"use server";

import { z } from "zod";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { mergeGuestCartWithUserCart } from "./cart"; // Import the merge function

// Validation schemas (keeping your existing ones)
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .superRefine((val, ctx) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Email format is invalid. Make sure it looks like 'example@domain.com'.",
        });
      }
    }),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, "Password must be at least 6 characters long."),
});

const signupSchema = z.object({
  firstName: z.string().superRefine((val, ctx) => {
    if (val.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "First name must be at least 2 characters long.",
      });
      return;
    }
    if (val.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "First name must be less than 50 characters long.",
      });
      return;
    }
    if (!/^[a-zA-Z]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "First name can only contain letters (a-z, A-Z).",
      });
    }
  }),

  lastName: z.string().superRefine((val, ctx) => {
    if (val.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last name must be at least 2 characters long.",
      });
      return;
    }
    if (val.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last name must be less than 50 characters long.",
      });
      return;
    }
    if (!/^[a-zA-Z]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last name can only contain letters (a-z, A-Z).",
      });
    }
  }),

  email: z
    .string()
    .min(1, "Email is required.")
    .superRefine((val, ctx) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email format is invalid. Example: 'yourname@example.com'.",
        });
      }
    }),

  password: z.string().superRefine((val, ctx) => {
    if (val.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters long.",
      });
      return;
    }
    if (!/[a-z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain at least one lowercase letter.",
      });
      return;
    }
    if (!/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain at least one uppercase letter.",
      });
      return;
    }
    if (!/\d/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain at least one number.",
      });
      return;
    }
    if (!/[@$!%*?&]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Password must contain at least one special character (e.g., !@#$%^&*).",
      });
    }
  }),
});


export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  values?: {
    email?: string;
    password?: string;
  };
  toastType?: string;
  message?: string;
  redirect?: string;
  success?: boolean;
};

export type SignupState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
  };
  values?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };
  toastType?: string;
  message?: string;
  redirect?: string;
  success?: boolean;
};


export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const formValues = {
    email: email || "",
    password: password || "",
  };

  const validatedFields = loginSchema.safeParse({
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: formValues,
      message: "Missing or invalid fields. Failed to login.",
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || user.isGuest) {
      return {
        values: formValues,
        message: "Invalid credentials.",
        toastType: "error",
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        values: formValues,
        message: "Invalid credentials.",
        toastType: "error",
      };
    }

    // NEW: Merge guest cart before signing in
    await mergeGuestCartWithUserCart(user.id);

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    return {
      success: true,
      message: "Login successful!",
      toastType: "success",
      redirect: "/account",
    };

  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof AuthError) {
      return {
        values: formValues,
        message: "Authentication failed.",
        toastType: "error",
      };
    }
    return {
      values: formValues,
      message: "Something went wrong.",
      toastType: "error",
    };
  }
}

export async function signupAction(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const formValues = {
    firstName: firstName || "",
    lastName: lastName || "",
    email: email || "",
    password: password || "",
  };

  const validatedFields = signupSchema.safeParse({
    firstName,
    lastName,
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: formValues,
      message: "Missing or invalid fields. Failed to create account.",
    };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser && !existingUser.isGuest) {
      return {
        values: formValues,
        message: "A user with this email already exists.",
        toastType: "error",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        isGuest: false, // NEW: Mark as not a guest
      },
    });

    await db.cart.create({
      data: {
        userId: user.id,
      },
    });

    // NEW: Attempt to merge any existing guest cart
    await mergeGuestCartWithUserCart(user.id);

    return {
      success: true,
      message: "Account created successfully!",
      toastType: "success",
      redirect: "/signin",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      values: formValues,
      message: "Database error: Failed to create account.",
      toastType: "error",
    };
  }
}


import { signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}