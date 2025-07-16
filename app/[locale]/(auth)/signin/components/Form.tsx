"use client";
import { Input } from "@/components/ui/input";
import Check from "@/public/assets/check.svg";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import React from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/server/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

const initialState: LoginState = { message: "", errors: {} };

function Form() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, dispatch] = useActionState(loginAction, initialState);
  const { pending } = useFormStatus();
  const { refreshCart } = useCart();
  const router = useRouter();
  const { update } = useSession();
  const t = useTranslations('auth.signin');
  
  // Use ref to track if we've already handled this success
  const processedSuccess = useRef(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const handleLoginSuccess = async () => {
      if (state.success && !processedSuccess.current) {
        processedSuccess.current = true;
        
        toast.custom(() => (
          <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
            <Check />
            <p className="font-semibold uppercase">{t('loginSuccessful')}</p>
          </div>
        ));
        
        refreshCart();
        
        try {
          await update();
        } catch (error) {
          console.error('Session update failed:', error);
        }
        
        if (state.redirect) {
          router.push(state.redirect);
        }
      }
    };

    if (state.success) {
      handleLoginSuccess();
    } else if (state.message && state.toastType === "error") {
      toast.error(state.message);
    }
    
    if (!state.success) {
      processedSuccess.current = false;
    }
  }, [
    state.success,
    state.message,
    state.toastType,
    state.redirect,
    t,
    // Note: We don't include update, refreshCart, or router in deps
    // because they're stable references and including them would cause
    // unnecessary re-runs
  ]);

  return (
    <div className="w-full lg:px-20">
      <form action={dispatch} noValidate className="w-full space-y-4">
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
          {pending ? t('loggingIn') : t('login')}
        </Button>
      </form>
    </div>
  );
}

export default Form;