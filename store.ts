import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./sanity.types";

// Only what the cart needs, so the saved cart stays small
export interface CartProduct {
  _id: string;
  name?: string;
  slug?: string;
  image?: NonNullable<Product["images"]>[number];
  price?: number;
  stock?: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const toCartProduct = (product: Product): CartProduct => ({
  _id: product._id,
  name: product.name,
  slug: product.slug?.current,
  image: product.images?.[0],
  price: product.price,
  stock: product.stock,
});

// Never allow more than the stock the admin entered (no stock set = no limit)
const clampQuantity = (quantity: number, stock?: number) =>
  Math.max(1, typeof stock === "number" ? Math.min(quantity, stock) : quantity);

// Saved in the browser (localStorage) so customers keep their cart without logging in
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.product._id === product._id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product._id === product._id
                  ? { product: toCartProduct(product), quantity: clampQuantity(item.quantity + 1, product.stock) }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product: toCartProduct(product), quantity: 1 }] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product._id === productId
              ? { ...item, quantity: clampQuantity(quantity, item.product.stock) }
              : item
          ),
        })),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.product._id !== productId) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "jss-cart" }
  )
);

export const getCartCount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const getCartTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0);

// The saved cart only exists in the browser; wait for it before showing counts to avoid a flash of 0
export const useCartHydrated = () => {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
};
