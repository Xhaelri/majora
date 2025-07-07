"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { getCartData } from "@/server/actions/cart";
import { useSession } from "next-auth/react";

type CartData = Awaited<ReturnType<typeof getCartData>>;

type CartContextType = {
  items: CartData["items"];
  count: number;
  isLoading: boolean;
  refreshCart: () => void;
  clearClientCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartData["items"]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const cartRes = await fetch("/api/cart");
      const { items, count } = await cartRes.json();

      setItems(items || []);
      setCount(count || 0);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setItems([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearClientCart = () => {
    setItems([]);
    setCount(0);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    }
    if (status === "unauthenticated") {
      // When user logs out, clear the client-side cart immediately
      clearClientCart();
      // Also fetch the guest cart
      fetchCart();
    }
  }, [status, session, fetchCart]); // Depend on session object as well

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        isLoading,
        refreshCart: fetchCart,
        clearClientCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
