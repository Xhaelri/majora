"use client";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import React from "react";
import { useFormStatus } from "react-dom";
import { signupAction, type SignupState } from "@/server/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const initialState: SignupState = { message: "", errors: {} };

function Form() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, dispatch] = useActionState(signupAction, initialState);
  const { pending } = useFormStatus();
  const t = useTranslations('auth.signup');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();

  useEffect(() => {
    if (state.message && state.toastType) {
      if (state.toastType === "success") {
        toast.success(state.message);
        if (state.redirect) {
          router.push(state.redirect);
        }
      } else if (state.toastType === "error") {
        toast.error(state.message);
      }
    }
  }, [state.message, state.toastType, state.redirect, router]);

  return (
    <form action={dispatch} noValidate className="w-full lg:px-20">
      <div className="w-full space-y-4">
        <div className="flex w-full justify-center gap-2 items-start">
          <div className="w-full">
            <div className="relative flex gap-2 items-center rounded-md border focus-within:ring-1 focus-within:ring-ring pl-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder={t('firstName')}
                className="border-0 focus-visible:ring-0 shadow-none"
                aria-describedby="firstName-error"
                defaultValue={state?.values?.firstName || ""}
              />
            </div>
            <div id="firstName-error" aria-live="polite" aria-atomic="true">
              {state.errors?.firstName &&
                state.errors.firstName.map((error: string) => (
                  <p className="text-sm text-red-500 mt-1" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          <div className="w-full">
            <div className="relative flex gap-2 items-center rounded-md border focus-within:ring-1 focus-within:ring-ring pl-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder={t('lastName')}
                className="border-0 focus-visible:ring-0 shadow-none"
                aria-describedby="lastName-error"
                defaultValue={state?.values?.lastName || ""}
              />
            </div>
            <div id="lastName-error" aria-live="polite" aria-atomic="true">
              {state.errors?.lastName &&
                state.errors.lastName.map((error: string) => (
                  <p className="text-sm text-red-500 mt-1" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div>
          <div className="relative flex gap-2 items-center rounded-md border focus-within:ring-1 focus-within:ring-ring pl-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('email')}
              className="border-0 focus-visible:ring-0 shadow-none"
              aria-describedby="email-error"
              defaultValue={state?.values?.email || ""}
            />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="text-sm text-red-500 mt-1" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div>
          <div className="relative flex gap-2 items-center rounded-md border focus-within:ring-1 focus-within:ring-ring px-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t('password')}
              className="border-0 focus-visible:ring-0 shadow-none"
              aria-describedby="password-error"
              defaultValue={state?.values?.password || ""}
            />
            <button type="button" onClick={togglePasswordVisibility}>
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          <div id="password-error" aria-live="polite" aria-atomic="true">
            {state.errors?.password &&
              state.errors.password.map((error: string) => (
                <p className="text-sm text-red-500 mt-1" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full cursor-pointer"
          size={"login"}
          disabled={pending}
        >
          {pending ? t('signingUp') : t('signUp')}
        </Button>
      </div>
    </form>
  );
}

export default Form;