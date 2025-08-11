"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  getCartData,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
} from "@/server/actions/cart";
import { useSession } from "next-auth/react";

type CartData = Awaited<ReturnType<typeof getCartData>>;

type CartContextType = {
  items: CartData["items"];
  count: number;
  refreshCart: () => void;
  clearClientCart: () => void;
  addToCartContext: (
    productVariantId: string,
    quantity: number
  ) => Promise<void>;
  updateQuantityContext: (
    productVariantId: string,
    quantity: number
  ) => Promise<void>;
  removeFromCartContext: (productVariantId: string) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cartData, setCartData] = useState<CartData>({ items: [], count: 0 });
  const { status } = useSession();

  const fetchCart = async () => {
    try {
      const newCartData = await getCartData();
      setCartData(newCartData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const refreshCart = () => {
    fetchCart();
  };

  const clearClientCart = () => {
    setCartData({ items: [], count: 0 });
  };

  const addToCartContext = async (
    productVariantId: string,
    quantity: number
  ) => {
    try {
      const { success, count, updatedItems } = await addToCart(
        productVariantId,
        quantity
      );

      if (success) {
        setCartData({ items: updatedItems ?? [], count: count ?? 0 });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const updateQuantityContext = async (
    productVariantId: string,
    quantity: number
  ) => {
    try {
      const { success, count, updatedItems } = await updateCartItemQuantity(
        productVariantId,
        quantity
      );

      if (success) {
        setCartData({ items: updatedItems ?? [], count: count ?? 0 });
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const removeFromCartContext = async (productVariantId: string) => {
    try {
      const { success, count, updatedItems } = await removeFromCart(
        productVariantId
      );

      if (success) {
        setCartData({ items: updatedItems ?? [], count: count ?? 0 });
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    }
    if (status === "unauthenticated") {
      clearClientCart();
      fetchCart();
    }
  }, [status]);

  return (
    <CartContext.Provider
      value={{
        items: cartData.items,
        count: cartData.count,
        refreshCart,
        clearClientCart,
        addToCartContext,
        updateQuantityContext,
        removeFromCartContext,
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
