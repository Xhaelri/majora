import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartState, CartProductVariant } from "../../types/cartTypes";
import { RootState } from "../store";

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (
      state,
      action: PayloadAction<{
        productVariant: CartProductVariant;
      }>
    ) => {
      const { productVariant } = action.payload;
      const existingItem = state.items.find(
        (item) => item.productVariant.id === productVariant.id
      );

      if (existingItem) return;

      const quantity = 1;
      state.items.push({ productVariant, quantity });
      state.totalQuantity += quantity;
      state.totalPrice +=
        (productVariant.product.salePrice || productVariant.product.price) *
        quantity;
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const itemIdToRemove = action.payload;
      const removedItem = state.items.find(
        (item) => item.productVariant.id === itemIdToRemove
      );

      if (removedItem) {
        state.totalQuantity -= removedItem.quantity;
        state.totalPrice -=
          (removedItem.productVariant.product.salePrice ||
            removedItem.productVariant.product.price) * removedItem.quantity;

        state.items = state.items.filter(
          (item) => item.productVariant.id !== itemIdToRemove
        );
      }
    },
    incQuantity: (state, action: PayloadAction<{ cartItemId: string }>) => {
      const { cartItemId } = action.payload;
      const item = state.items.find((i) => i.productVariant.id === cartItemId);

      if (item) {
        item.quantity += 1;
        state.totalQuantity += 1;
        state.totalPrice +=
          item.productVariant.product.salePrice ||
          item.productVariant.product.price;
      }
    },
    decQuantity: (state, action: PayloadAction<{ cartItemId: string }>) => {
      const { cartItemId } = action.payload;
      const item = state.items.find((i) => i.productVariant.id === cartItemId);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
        state.totalQuantity -= 1;
        state.totalPrice -=
          item.productVariant.product.salePrice ||
          item.productVariant.product.price;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  incQuantity,
  decQuantity,
  clearCart,
} = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectTotalQuantity = (state: RootState) =>
  state.cart.totalQuantity;
export const selectTotalPrice = (state: RootState) => state.cart.totalPrice;

export default cartSlice.reducer;
