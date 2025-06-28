"use client";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from "react";

// Zod schema for form validation
const formSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

type FormData = z.infer<typeof formSchema>;

function Form() {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Validate on change for better UX
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      console.log("Form submitted:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
      alert("Form submitted successfully!");
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <form className="w-full px-20" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full space-y-4">
        <div className="flex w-full justify-center gap-2 items-start">
          <div className="w-full">
            <div className="relative flex items-center rounded-md border focus-within:ring-1 focus-within:ring-ring pl-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <Input
                {...register("firstName")}
                type="text"
                placeholder="First Name"
                className="border-0 focus-visible:ring-0 shadow-none"
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
            )}
          </div>
          
          <div className="w-full">
            <div className="relative flex items-center rounded-md border focus-within:ring-1 focus-within:ring-ring pl-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <Input
                {...register("lastName")}
                type="text"
                placeholder="Last Name"
                className="border-0 focus-visible:ring-0 shadow-none"
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
          type="submit" 
          className="w-full cursor-pointer" 
          size={"login"}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}

export default Form;