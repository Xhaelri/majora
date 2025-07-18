"use server";

import { z } from "zod";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { mergeGuestCartWithUserCart } from "./cart";
import { getTranslations } from "next-intl/server";


type TranslationFunction = Awaited<ReturnType<typeof getTranslations>>;

const createLoginSchema = (t: TranslationFunction) => z.object({
  email: z
    .string()
    .min(1, t("errors.emailRequired"))
    .superRefine((val, ctx) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("errors.emailInvalid"),
        });
      }
    }),
  password: z
    .string()
    .min(1, t("errors.passwordRequired"))
    .min(6, t("errors.passwordMinLength")),
});

const createSignupSchema = (t: TranslationFunction) => z.object({
  firstName: z.string().superRefine((val, ctx) => {
    if (val.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.firstNameMinLength"),
      });
      return;
    }
    if (val.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.firstNameMaxLength"),
      });
      return;
    }
    if (!/^[a-zA-Z]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.firstNameLettersOnly"),
      });
    }
  }),

  lastName: z.string().superRefine((val, ctx) => {
    if (val.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.lastNameMinLength"),
      });
      return;
    }
    if (val.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.lastNameMaxLength"),
      });
      return;
    }
    if (!/^[a-zA-Z]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.lastNameLettersOnly"),
      });
    }
  }),

  email: z
    .string()
    .min(1, t("errors.emailRequired"))
    .superRefine((val, ctx) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("errors.emailInvalid"),
        });
      }
    }),

  password: z.string().superRefine((val, ctx) => {
    if (val.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.passwordMinLength8"),
      });
      return;
    }
    if (!/[a-z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.passwordLowercase"),
      });
      return;
    }
    if (!/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.passwordUppercase"),
      });
      return;
    }
    if (!/\d/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.passwordNumber"),
      });
      return;
    }
    if (!/[@$!%*?&]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("errors.passwordSpecialChar"),
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
  const t = await getTranslations('auth.signin');
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string;

  const formValues = {
    email: email || "",
    password: password || "",
  };

  const loginSchema = createLoginSchema(t);
  const validatedFields = loginSchema.safeParse({
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: formValues,
      message: t("errors.invalidFields"),
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || user.isGuest) {
      return {
        values: formValues,
        message: t("errors.invalidCredentials"),
        toastType: "error",
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        values: formValues,
        message: t("errors.invalidCredentials"),
        toastType: "error",
      };
    }

    await mergeGuestCartWithUserCart(user.id);

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: t("loginSuccessful"),
      toastType: "success",
      redirect: callbackUrl || "/account",
    };
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof AuthError) {
      return {
        values: formValues,
        message: t("errors.authFailed"),
        toastType: "error",
      };
    }
    return {
      values: formValues,
      message: t("errors.somethingWrong"),
      toastType: "error",
    };
  }
}

export async function signupAction(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const t = await getTranslations('auth.signup');
  
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string;

  const formValues = {
    firstName: firstName || "",
    lastName: lastName || "",
    email: email || "",
    password: password || "",
  };

  const signupSchema = createSignupSchema(t);
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
      message: t("errors.invalidFields"),
    };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser && !existingUser.isGuest) {
      return {
        values: formValues,
        message: t("errors.userExists"),
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
        isGuest: false, 
      },
    });

    await db.cart.create({
      data: {
        userId: user.id,
      },
    });

    await mergeGuestCartWithUserCart(user.id);

    // If there's a callbackUrl, redirect to signin with it, otherwise just signin
    const redirectUrl = callbackUrl ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signin";

    return {
      success: true,
      message: t("accountCreated"),
      toastType: "success",
      redirect: redirectUrl,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      values: formValues,
      message: t("errors.dbError"),
      toastType: "error",
    };
  }
}

export async function handleGoogleSignIn(formData?: FormData) {
  const callbackUrl = formData?.get("callbackUrl") as string;
  
  await signIn("google", { 
    redirectTo: callbackUrl || "/" 
  });
  
  const session = await auth();
  if (session?.user) {
    await mergeGuestCartWithUserCart(session?.user?.id);
  }
}

import { signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}