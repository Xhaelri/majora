"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Check } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function SignOut() {
  const { clearClientCart } = useCart();

  const handleLogout = async () => {
    clearClientCart();
    toast.custom(() => (
          <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
              <Check />
              <p className="font-semibold uppercase">Logged Out successfully.</p>
          </div>
      ));
    await signOut({ redirectTo: "/signin" });
  };

  return (
    <Button onClick={handleLogout} variant="destructive" className="cursor-pointer px-10 w-50 lg:w-full">
      Logout
    </Button>
  );
}
