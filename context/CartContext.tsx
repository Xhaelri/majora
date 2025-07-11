"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
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
  optimisticAddToCart: (productVariantId: string, quantity: number) => void;
  optimisticUpdateQuantity: (
    productVariantId: string,
    quantity: number
  ) => void;
  optimisticRemoveFromCart: (productVariantId: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartData["items"]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCart = useCallback(async (force = false) => {
    // Cancel previous request if it's still pending
    if (abortControllerRef.current && !force) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (force) setIsLoading(true);

    try {
      const cartRes = await fetch("/api/cart", {
        signal: abortControllerRef.current.signal,
        // Add cache headers for better performance
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!cartRes.ok) throw new Error("Failed to fetch cart");

      const { items, count } = await cartRes.json();

      setCount(count || 0);
      setItems(items || []);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to fetch cart:", error);
        // Only reset on actual errors, not aborts
        setCount(0);
        setItems([]);
      }
    } finally {
      if (force) setIsLoading(false);
    }
  }, []);

  const clearClientCart = () => {
    setItems([]);
    setCount(0);
  };

  // Optimistic update functions
  const optimisticAddToCart = useCallback(
    (productVariantId: string, quantity: number) => {
      setItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.productVariantId === productVariantId
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          const newItems = [...prevItems];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
          };
          return newItems;
        } else {
          // For new items, we can't show full details without the product data
          // So we'll just update the count and refresh after server response
          return prevItems;
        }
      });

      setCount((prevCount) => prevCount + quantity);
    },
    []
  );

  const optimisticUpdateQuantity = useCallback(
    (productVariantId: string, quantity: number) => {
      setItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.productVariantId === productVariantId
        );

        if (existingItemIndex >= 0) {
          const oldQuantity = prevItems[existingItemIndex].quantity;

          if (quantity <= 0) {
            // Remove item
            const newItems = prevItems.filter(
              (item) => item.productVariantId !== productVariantId
            );
            setCount((prevCount) => prevCount - oldQuantity);
            return newItems;
          } else {
            // Update quantity
            const newItems = [...prevItems];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity,
            };
            setCount((prevCount) => prevCount - oldQuantity + quantity);
            return newItems;
          }
        }
        return prevItems;
      });
    },
    []
  );

  const optimisticRemoveFromCart = useCallback((productVariantId: string) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productVariantId === productVariantId
      );
      if (existingItem) {
        setCount((prevCount) => prevCount - existingItem.quantity);
        return prevItems.filter(
          (item) => item.productVariantId !== productVariantId
        );
      }
      return prevItems;
    });
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart(true);
    }
    if (status === "unauthenticated") {
      clearClientCart();
      fetchCart(true);
    }
  }, [status, session, fetchCart]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        isLoading,
        refreshCart: () => fetchCart(true),
        clearClientCart,
        optimisticAddToCart,
        optimisticUpdateQuantity,
        optimisticRemoveFromCart,
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
