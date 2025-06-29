"use client";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import React from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/server/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const initialState: LoginState = { message: "", errors: {} };

function Form() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, dispatch] = useActionState(loginAction, initialState);
  const { pending } = useFormStatus();

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
    <div className="w-full px-20">
      <form action={dispatch} noValidate className="w-full space-y-4">
        <div>
          <div className="relative flex gap-2 items-center rounded-md border focus-within:ring-1 focus-within:ring-ring pl-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
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
              placeholder="Password"
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
          {pending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}

export default Form;