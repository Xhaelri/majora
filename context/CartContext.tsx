"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  getCartDataForAuthUser,
  addToCart,
  updateCartItemQuantity,
  mergeLocalStorageCart,
  getProductVariants,
} from "@/server/actions/cart-actions";
import { useSession } from "next-auth/react";
import { CartItemUI, CartState, LocalCartItem } from "@/types/cart-types";

interface CartContextType {
  items: CartItemUI[];
  totalQuantity: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "guest_cart";

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
    isLoading: true,
    error: null,
  });

  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { totalQuantity, totalPrice } = useMemo(() => {
    const quantity = cartState.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const price = cartState.items.reduce((sum, item) => {
      const itemPrice = item.salePrice ?? item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
    return { totalQuantity: quantity, totalPrice: price };
  }, [cartState.items]);

  useEffect(() => {
    setCartState((prev) => ({ ...prev, totalQuantity, totalPrice }));
  }, [totalQuantity, totalPrice]);

  const getLocalStorageCart = useCallback((): LocalCartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading localStorage cart:", error);
      return [];
    }
  }, []);

  const setLocalStorageCart = useCallback((cartItems: LocalCartItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving to localStorage cart:", error);
    }
  }, []);

  const clearLocalStorageCart = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage cart:", error);
    }
  }, []);

  const fetchServerCart = useCallback(async () => {
    setCartState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const cartData = await getCartDataForAuthUser();
      setCartState((prev) => ({
        ...prev,
        items: cartData.items,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch server cart:", error);
      setCartState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch cart",
      }));
    }
  }, []);

  const fetchAndSetGuestCart = useCallback(
    async (localCart: LocalCartItem[]) => {
      if (localCart.length === 0) {
        setCartState({
          items: [],
          totalQuantity: 0,
          totalPrice: 0,
          isLoading: false,
          error: null,
        });
        return;
      }

      setCartState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await getProductVariants(localCart);
        if (result.success && result.updatedItems) {
          setCartState((prev) => ({
            ...prev,
            items: result.updatedItems!,
            isLoading: false,
          }));

          const updatedLocalCart = result.updatedItems.map((item) => ({
            productVariantId: item.variantId,
            quantity: item.quantity,
          }));
          setLocalStorageCart(updatedLocalCart);
        } else {
          setCartState((prev) => ({
            ...prev,
            isLoading: false,
            error: result.error || "Failed to load guest cart.",
          }));
        }
      } catch (error) {
        console.error("Error fetching guest cart:", error);
        setCartState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load guest cart.",
        }));
      }
    },
    [setLocalStorageCart]
  );

  useEffect(() => {
    if (status === "loading") {
      setCartState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (isAuthenticated) {
      const localCart = getLocalStorageCart();
      if (localCart.length > 0) {
        setCartState((prev) => ({ ...prev, isLoading: true }));
        mergeLocalStorageCart(localCart)
          .then((result) => {
            if (result.success && result.updatedItems) {
              setCartState((prev) => ({
                ...prev,
                items: result.updatedItems!,
                isLoading: false,
              }));
              clearLocalStorageCart();
            } else {
              throw new Error(result.error || "Failed to merge cart");
            }
          })
          .catch((error) => {
            console.error("Failed to merge cart:", error);

            fetchServerCart();
          });
      } else {
        fetchServerCart();
      }
    } else {
      const localCart = getLocalStorageCart();
      fetchAndSetGuestCart(localCart);
    }
  }, [
    status,
    isAuthenticated,
    getLocalStorageCart,
    clearLocalStorageCart,
    fetchServerCart,
    fetchAndSetGuestCart,
  ]);

  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      await fetchServerCart();
    } else {
      const localCart = getLocalStorageCart();
      await fetchAndSetGuestCart(localCart);
    }
  }, [
    isAuthenticated,
    fetchServerCart,
    getLocalStorageCart,
    fetchAndSetGuestCart,
  ]);

  const clearClientCart = useCallback(() => {
    setCartState({
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,
    });
    if (!isAuthenticated) {
      clearLocalStorageCart();
    }
  }, [isAuthenticated, clearLocalStorageCart]);

  const addToCartContext = async (
    productVariantId: string,
    quantity: number
  ) => {
    setCartState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (isAuthenticated) {
      const result = await addToCart(productVariantId, quantity);
      if (result.success && result.updatedItems) {
        setCartState((prev) => ({
          ...prev,
          items: result.updatedItems!,
          isLoading: false,
        }));
      } else {
        setCartState((prev) => ({
          ...prev,
          error: result.error || "Failed to add item",
          isLoading: false,
        }));

        await fetchServerCart();
      }
    } else {
      const localCart = getLocalStorageCart();
      const existingItemIndex = localCart.findIndex(
        (item) => item.productVariantId === productVariantId
      );

      let updatedLocalCart: LocalCartItem[];
      if (existingItemIndex >= 0) {
        updatedLocalCart = localCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedLocalCart = [...localCart, { productVariantId, quantity }];
      }

      setLocalStorageCart(updatedLocalCart);
      await fetchAndSetGuestCart(updatedLocalCart);
    }
  };

  const updateQuantityContext = async (
    productVariantId: string,
    newQuantity: number
  ) => {
    setCartState((prev) => ({ ...prev, error: null }));
    const originalItems = cartState.items;

    const updatedItems =
      newQuantity <= 0
        ? originalItems.filter((item) => item.variantId !== productVariantId)
        : originalItems.map((item) =>
            item.variantId === productVariantId
              ? { ...item, quantity: newQuantity }
              : item
          );
    setCartState((prev) => ({ ...prev, items: updatedItems }));

    if (isAuthenticated) {
      const result = await updateCartItemQuantity(
        productVariantId,
        newQuantity
      );
      if (!result.success || !result.updatedItems) {
        setCartState((prev) => ({
          ...prev,
          items: originalItems,
          error: result.error || "Failed to update quantity",
        }));
      } else {
        setCartState((prev) => ({ ...prev, items: result.updatedItems! }));
      }
    } else {
      const localCart = getLocalStorageCart();
      const updatedLocalCart =
        newQuantity <= 0
          ? localCart.filter(
              (item) => item.productVariantId !== productVariantId
            )
          : localCart.map((item) =>
              item.productVariantId === productVariantId
                ? { ...item, quantity: newQuantity }
                : item
            );
      setLocalStorageCart(updatedLocalCart);
    }
  };

  const removeFromCartContext = async (productVariantId: string) => {
    await updateQuantityContext(productVariantId, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items: cartState.items,
        totalQuantity,
        totalPrice,
        isLoading: cartState.isLoading,
        error: cartState.error,
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
