"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import {
  getCartDataForAuthUser,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  mergeLocalStorageCart,
  getProductVariants,
} from "@/server/actions/cart";
import { useSession } from "next-auth/react";
import { CartItem, CartState, LocalCartItem } from "@/types/cartTypes";

type CartContextType = {
  items: CartItem[];
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
};

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

  const { data: session, status } = useSession();

  const { totalQuantity, totalPrice } = useMemo(() => {
    const quantity = cartState.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const price = cartState.items.reduce((sum, item) => {
      const itemPrice =
        item.productVariant.product.salePrice ||
        item.productVariant.product.price;
      return sum + itemPrice * item.quantity;
    }, 0);
    return { totalQuantity: quantity, totalPrice: price };
  }, [cartState.items]);

  useEffect(() => {
    setCartState((prev) => ({
      ...prev,
      totalQuantity,
      totalPrice,
    }));
  }, [totalQuantity, totalPrice]);

  const getLocalStorageCart = (): LocalCartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading localStorage cart:", error);
      return [];
    }
  };

  const setLocalStorageCart = (cartItems: LocalCartItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving to localStorage cart:", error);
    }
  };

  const clearLocalStorageCart = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage cart:", error);
    }
  };

  // Fetch and set guest cart from localStorage
  const fetchAndSetGuestCart = async (localCart: LocalCartItem[]) => {
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

    try {
      setCartState((prev) => ({ ...prev, isLoading: true }));
      const result = await getProductVariants(localCart);
      if (result.success) {
        setCartState((prev) => ({
          ...prev,
          items: result.items,
          isLoading: false,
        }));
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
  };

  const fetchServerCart = async () => {
    try {
      setCartState((prev) => ({ ...prev, isLoading: true, error: null }));
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
  };

  const refreshCart = async () => {
    if (session?.user) {
      await fetchServerCart();
    } else {
      const localCart = getLocalStorageCart();
      await fetchAndSetGuestCart(localCart);
    }
  };

  const clearClientCart = () => {
    setCartState({
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,
    });
    if (!session?.user) {
      clearLocalStorageCart();
    }
  };

  // Helper function to apply optimistic update for authenticated users
  const applyOptimisticUpdate = (
    operation: 'add' | 'update' | 'remove',
    productVariantId: string,
    quantity?: number
  ) => {
    setCartState((prev) => {
      const items = [...prev.items];
      const existingIndex = items.findIndex(
        item => item.productVariant.id === productVariantId
      );

      switch (operation) {
        case 'add':
          if (existingIndex >= 0) {
            // Update existing item
            items[existingIndex] = {
              ...items[existingIndex],
              quantity: items[existingIndex].quantity + (quantity || 1)
            };
          }
          // Note: For new items, we'd need product data which we don't have immediately
          // So we'll only do optimistic updates for existing items in add operation
          break;

        case 'update':
          if (existingIndex >= 0) {
            if ((quantity || 0) <= 0) {
              // Remove item
              items.splice(existingIndex, 1);
            } else {
              // Update quantity
              items[existingIndex] = {
                ...items[existingIndex],
                quantity: quantity || 0
              };
            }
          }
          break;

        case 'remove':
          if (existingIndex >= 0) {
            items.splice(existingIndex, 1);
          }
          break;
      }

      return {
        ...prev,
        items,
        error: null
      };
    });
  };

  // Helper function to revert optimistic update on error
  const revertOptimisticUpdate = async () => {
    // Refresh cart from server to revert any optimistic changes
    if (session?.user) {
      await fetchServerCart();
    }
  };

  const addToCartContext = async (
    productVariantId: string,
    quantity: number
  ) => {
    setCartState((prev) => ({ ...prev, error: null }));
    
    if (session?.user) {
      // Authenticated user - apply optimistic update first
      const existingItem = cartState.items.find(
        item => item.productVariant.id === productVariantId
      );

      // Only apply optimistic update if item already exists (we have the product data)
      if (existingItem) {
        applyOptimisticUpdate('add', productVariantId, quantity);
      }

      try {
        // Perform server operation
        const result = await addToCart(productVariantId, quantity);
        
        if (result.success && result.updatedItems) {
          // Server operation succeeded - update with server data
          setCartState((prev) => ({ ...prev, items: result.updatedItems }));
        } else {
          // Server operation failed - revert optimistic changes
          await revertOptimisticUpdate();
          setCartState((prev) => ({
            ...prev,
            error: result.error || "Failed to add item",
          }));
        }
      } catch (error) {
        // Network/unexpected error - revert optimistic changes
        await revertOptimisticUpdate();
        setCartState((prev) => ({
          ...prev,
          error: "Failed to add item to cart",
        }));
      }
    } else {
      // Guest user - handle locally (existing logic)
      try {
        // Update localStorage first
        const localCart = getLocalStorageCart();
        const existingItemIndex = localCart.findIndex(
          (item) => item.productVariantId === productVariantId
        );
        
        let updatedLocalCart: LocalCartItem[];
        if (existingItemIndex >= 0) {
          updatedLocalCart = localCart.map((item) =>
            item.productVariantId === productVariantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedLocalCart = [...localCart, { productVariantId, quantity }];
        }
        
        setLocalStorageCart(updatedLocalCart);
        
        // Update UI state immediately
        const existingCartItemIndex = cartState.items.findIndex(
          item => item.productVariant.id === productVariantId
        );
        
        if (existingCartItemIndex >= 0) {
          // Item exists in cart - just update quantity
          setCartState((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
              item.productVariant.id === productVariantId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }));
        } else {
          // New item - need to fetch product details and add to cart
          await fetchAndSetGuestCart(updatedLocalCart);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        setCartState((prev) => ({
          ...prev,
          error: "Failed to add item to cart",
        }));
      }
    }
  };

  const updateQuantityContext = async (
    productVariantId: string,
    newQuantity: number
  ) => {
    setCartState((prev) => ({ ...prev, error: null }));
    
    if (session?.user) {
      // Authenticated user - apply optimistic update first
      applyOptimisticUpdate('update', productVariantId, newQuantity);

      try {
        // Perform server operation
        const result = await updateCartItemQuantity(productVariantId, newQuantity);
        
        if (result.success && result.updatedItems) {
          // Server operation succeeded - update with server data
          setCartState((prev) => ({ ...prev, items: result.updatedItems }));
        } else {
          // Server operation failed - revert optimistic changes
          await revertOptimisticUpdate();
          setCartState((prev) => ({
            ...prev,
            error: result.error || "Failed to update item",
          }));
        }
      } catch (error) {
        // Network/unexpected error - revert optimistic changes
        await revertOptimisticUpdate();
        setCartState((prev) => ({
          ...prev,
          error: "Failed to update quantity",
        }));
      }
    } else {
      // Guest user - handle locally (existing logic)
      try {
        // Get current localStorage cart
        const currentLocalCart = getLocalStorageCart();
        
        // Update localStorage first
        let updatedLocalCart: LocalCartItem[];
        if (newQuantity <= 0) {
          // Remove item completely
          updatedLocalCart = currentLocalCart.filter(
            (item) => item.productVariantId !== productVariantId
          );
        } else {
          // Update quantity
          updatedLocalCart = currentLocalCart.map((item) =>
            item.productVariantId === productVariantId
              ? { ...item, quantity: newQuantity }
              : item
          );
        }
        
        // Save to localStorage
        setLocalStorageCart(updatedLocalCart);

        // Update UI state immediately
        if (newQuantity <= 0) {
          // Remove from UI
          setCartState((prev) => ({
            ...prev,
            items: prev.items.filter(
              (item) => item.productVariant.id !== productVariantId
            ),
          }));
        } else {
          // Update quantity in UI
          setCartState((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
              item.productVariant.id === productVariantId
                ? { ...item, quantity: newQuantity }
                : item
            ),
          }));
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        setCartState((prev) => ({
          ...prev,
          error: "Failed to update quantity",
        }));
      }
    }
  };

  const removeFromCartContext = async (productVariantId: string) => {
    setCartState((prev) => ({ ...prev, error: null }));
    
    if (session?.user) {
      // Authenticated user - apply optimistic update first
      applyOptimisticUpdate('remove', productVariantId);

      try {
        // Perform server operation
        const result = await removeFromCart(productVariantId);
        
        if (result.success && result.updatedItems) {
          // Server operation succeeded - update with server data
          setCartState((prev) => ({ ...prev, items: result.updatedItems }));
        } else {
          // Server operation failed - revert optimistic changes
          await revertOptimisticUpdate();
          setCartState((prev) => ({
            ...prev,
            error: result.error || "Failed to remove item",
          }));
        }
      } catch (error) {
        // Network/unexpected error - revert optimistic changes
        await revertOptimisticUpdate();
        setCartState((prev) => ({
          ...prev,
          error: "Failed to remove item",
        }));
      }
    } else {
      // Guest user - handle locally (existing logic)
      try {
        // Get current localStorage cart and filter out the item
        const currentLocalCart = getLocalStorageCart();
        const updatedLocalCart = currentLocalCart.filter(
          (item) => item.productVariantId !== productVariantId
        );
        
        // Save updated cart to localStorage
        setLocalStorageCart(updatedLocalCart);
        
        // Update UI state immediately
        setCartState((prev) => ({
          ...prev,
          items: prev.items.filter(
            (item) => item.productVariant.id !== productVariantId
          ),
        }));
      } catch (error) {
        console.error("Error removing from cart:", error);
        setCartState((prev) => ({
          ...prev,
          error: "Failed to remove item",
        }));
      }
    }
  };

  // Initialize cart on component mount and session changes
  useEffect(() => {
    if (status === "loading") {
      setCartState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (status === "authenticated") {
      const localCart = getLocalStorageCart();
      if (localCart.length > 0) {
        // Merge local cart with server cart
        setCartState((prev) => ({ ...prev, isLoading: true }));
        mergeLocalStorageCart(localCart)
          .then((result) => {
            if (result.success) {
              clearLocalStorageCart();
              return fetchServerCart();
            }
            throw new Error(result.error || "Failed to merge cart");
          })
          .catch((error) => {
            console.error("Failed to merge cart:", error);
            setCartState((prev) => ({
              ...prev,
              isLoading: false,
              error: "Failed to merge cart data",
            }));
          });
      } else {
        // No local cart, just fetch server cart
        fetchServerCart();
      }
    } else {
      // Unauthenticated - load from localStorage
      const localCart = getLocalStorageCart();
      fetchAndSetGuestCart(localCart);
    }
  }, [status]);

  return (
    <CartContext.Provider
      value={{
        items: cartState.items,
        totalQuantity: cartState.totalQuantity,
        totalPrice: cartState.totalPrice,
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