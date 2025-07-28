"use client";

import React, { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { updateUserAction } from "@/server/actions/user-actions";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  phone: string | null;
  name: string | null;
}

interface AccountDetailsProps {
  user: UserData;
  userId: string;
}

type ActionState = {
  success: string | null;
  error: string | null;
  data: UserData | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-6 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export default function AccountDetails({ user, userId }: AccountDetailsProps) {
  const initialState: ActionState = {
    success: null,
    error: null,
    data: null,
  };

  const actionWithUserId = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    return updateUserAction(userId, prevState, formData);
  };
  
  const [state, formAction] = useActionState(actionWithUserId, initialState);

  useEffect(() => {
    if (state.success) {
      toast.custom(() => (
        <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
          <Check />
          <p className="font-semibold uppercase">{state.success}</p>
        </div>
      ));
    }
    
    if (state.error) {
      toast.custom(() => (
        <div className="bg-red-600 text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
          <p className="font-semibold uppercase">{state.error}</p>
        </div>
      ));
    }
  }, [state.success, state.error]);

  // Use updated data from server response or fallback to original user data
  const currentUserData = state.data || user;

  return (
    <section className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Account Details
          </h2>
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center mb-8 gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {currentUserData.name ||
                  `${currentUserData.firstName || ""} ${currentUserData.lastName || ""}`.trim() ||
                  "User"}
              </h3>
              <p className="text-gray-600 mt-1">
                {currentUserData.email || "No email provided"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  defaultValue={currentUserData.firstName || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  defaultValue={currentUserData.lastName || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={currentUserData.email || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                defaultValue={currentUserData.phone || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter phone number"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                defaultValue={currentUserData.address || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter address"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}