"use client";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from "react";

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Form() {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Validate on change for better UX
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Simulate API call
      console.log("Login form submitted:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
      alert("Login successful!");
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="w-full px-20">
      <div className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="relative flex items-center rounded-md border focus-within:ring-1 focus-within:ring-ring pl-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <Input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="border-0 focus-visible:ring-0 shadow-none"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="relative flex items-center rounded-md border focus-within:ring-1 focus-within:ring-ring px-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="border-0 focus-visible:ring-0 shadow-none"
            />
            <button type="button" onClick={togglePasswordVisibility}>
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <Button 
          type="button" 
          className="w-full cursor-pointer" 
          size={"login"}
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </div>
    </div>
  );
}

export default Form;