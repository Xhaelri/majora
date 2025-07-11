"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useOptimistic,
  useTransition,
} from "react";
import { getCartData, addToCart, updateCartItemQuantity, removeFromCart } from "@/server/actions/cart";
import { useSession } from "next-auth/react";

type CartData = Awaited<ReturnType<typeof getCartData>>;

type CartAction = 
  | { type: 'ADD_ITEM'; productVariantId: string; quantity: number }
  | { type: 'UPDATE_QUANTITY'; productVariantId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; productVariantId: string };

type CartContextType = {
  items: CartData["items"];
  count: number;
  isFetching: boolean; // Renamed from isLoading for cart fetching
  isMutating: boolean; // New state for cart mutations
  refreshCart: () => void;
  clearClientCart: () => void;
  addToCartOptimistic: (productVariantId: string, quantity: number) => Promise<void>;
  updateQuantityOptimistic: (productVariantId: string, quantity: number) => Promise<void>;
  removeFromCartOptimistic: (productVariantId: string) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartData, action: CartAction): CartData {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productVariantId === action.productVariantId
      );

      if (existingItemIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.quantity,
        };
        return {
          items: newItems,
          count: state.count + action.quantity,
        };
      } else {
        return {
          items: state.items,
          count: state.count + action.quantity,
        };
      }
    }

    case 'UPDATE_QUANTITY': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productVariantId === action.productVariantId
      );

      if (existingItemIndex >= 0) {
        const existingItem = state.items[existingItemIndex];
        const quantityDiff = action.quantity - existingItem.quantity;

        if (action.quantity <= 0) {
          return {
            items: state.items.filter(
              (item) => item.productVariantId !== action.productVariantId
            ),
            count: state.count - existingItem.quantity,
          };
        } else {
          const newItems = [...state.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: action.quantity,
          };
          return {
            items: newItems,
            count: state.count + quantityDiff,
          };
        }
      }
      return state;
    }

    case 'REMOVE_ITEM': {
      const existingItem = state.items.find(
        (item) => item.productVariantId === action.productVariantId
      );
      
      if (existingItem) {
        return {
          items: state.items.filter(
            (item) => item.productVariantId !== action.productVariantId
          ),
          count: state.count - existingItem.quantity,
        };
      }
      return state;
    }

    default:
      return state;
  }
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cartData, setCartData] = useState<CartData>({ items: [], count: 0 });
  const [optimisticCart, addOptimisticUpdate] = useOptimistic(
    cartData,
    cartReducer
  );
  const [isFetching, setIsFetching] = useState(true); // Renamed from isLoading
  const [isPending, startTransition] = useTransition();
  const { status } = useSession();

  const fetchCart = useCallback(async (force = false) => {
    if (force) setIsFetching(true);

    try {
      const newCartData = await getCartData();
      setCartData(newCartData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartData({ items: [], count: 0 });
    } finally {
      if (force) setIsFetching(false);
    }
  }, []);

  const refreshCart = useCallback(() => {
    fetchCart(true);
  }, [fetchCart]);

  const clearClientCart = useCallback(() => {
    setCartData({ items: [], count: 0 });
  }, []);

  // Optimistic server actions
  const addToCartOptimistic = useCallback(
    async (productVariantId: string, quantity: number) => {
      startTransition(async () => {
        addOptimisticUpdate({ type: 'ADD_ITEM', productVariantId, quantity });
        
        try {
          const result = await addToCart(productVariantId, quantity);
          if (result.success) {
            // Update base state with fresh data
            const newCartData = await getCartData();
            setCartData(newCartData);
          }
        } catch (error) {
          console.error("Failed to add to cart:", error);
          // On error, the optimistic update will automatically revert
          throw error;
        }
      });
    },
    [addOptimisticUpdate]
  );

  const updateQuantityOptimistic = useCallback(
    async (productVariantId: string, quantity: number) => {
      startTransition(async () => {
        addOptimisticUpdate({ type: 'UPDATE_QUANTITY', productVariantId, quantity });
        
        try {
          const result = await updateCartItemQuantity(productVariantId, quantity);
          if (result.success) {
            const newCartData = await getCartData();
            setCartData(newCartData);
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
          throw error;
        }
      });
    },
    [addOptimisticUpdate]
  );

  const removeFromCartOptimistic = useCallback(
    async (productVariantId: string) => {
      startTransition(async () => {
        addOptimisticUpdate({ type: 'REMOVE_ITEM', productVariantId });
        
        try {
          const result = await removeFromCart(productVariantId);
          if (result.success) {
            const newCartData = await getCartData();
            setCartData(newCartData);
          }
        } catch (error) {
          console.error("Failed to remove from cart:", error);
          throw error;
        }
      });
    },
    [addOptimisticUpdate]
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart(true);
    }
    if (status === "unauthenticated") {
      clearClientCart();
      fetchCart(true);
    }
  }, [status, fetchCart, clearClientCart]);

  return (
    <CartContext.Provider
      value={{
        items: optimisticCart.items,
        count: optimisticCart.count,
        isFetching, // Separate state for fetching
        isMutating: isPending, // Separate state for mutations
        refreshCart,
        clearClientCart,
        addToCartOptimistic,
        updateQuantityOptimistic,
        removeFromCartOptimistic,
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