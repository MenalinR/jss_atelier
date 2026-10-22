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

// Whose cart is showing: "guest" when nobody is logged in, otherwise the account ID
export const GUEST = "guest";

interface CartState {
  owner: string;
  // The carts of everyone else who used this browser, kept for when they log back in
  otherCarts: Record<string, CartItem[]>;
  items: CartItem[];
  // True once we know who is logged in (not saved), so nobody sees someone else's cart for a moment
  ownerChecked: boolean;
  switchOwner: (owner: string) => void;
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

// Adds the guest's items into an account's cart (same product = quantities added up)
const mergeCarts = (accountItems: CartItem[], guestItems: CartItem[]) => {
  const merged = accountItems.map((item) => ({ ...item }));
  for (const guestItem of guestItems) {
    const existing = merged.find((item) => item.product._id === guestItem.product._id);
    if (existing) existing.quantity = clampQuantity(existing.quantity + guestItem.quantity, guestItem.product.stock);
    else merged.push(guestItem);
  }
  return merged;
};

// Saved in the browser (localStorage), separately for each customer who logs in here
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      owner: GUEST,
      otherCarts: {},
      items: [],
      ownerChecked: false,
      switchOwner: (owner) =>
        set((state) => {
          if (state.owner === owner) return { ownerChecked: true };
          // Put the current cart away and take out the new owner's cart
          const otherCarts = { ...state.otherCarts, [state.owner]: state.items };
          let items = otherCarts[owner] || [];
          delete otherCarts[owner];
          // Logging in: keep what they added before logging in
          if (state.owner === GUEST && owner !== GUEST) {
            items = mergeCarts(items, state.items);
            delete otherCarts[GUEST];
          }
          return { owner, otherCarts, items, ownerChecked: true };
        }),
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
    {
      name: "jss-cart",
      // Version 1 = one cart per customer. The old single shared cart can't be
      // given to the right person, so it is cleared once.
      version: 1,
      migrate: () => ({ owner: GUEST, otherCarts: {}, items: [] }),
      partialize: ({ owner, otherCarts, items }) => ({ owner, otherCarts, items }),
    }
  )
);

export const getCartCount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const getCartTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0);

// The saved cart only exists in the browser; wait for it (and for the right customer's cart)
// before showing it, to avoid a flash of 0 or of someone else's cart
export const useCartHydrated = () => {
  const [hydrated, setHydrated] = React.useState(false);
  const ownerChecked = useCartStore((state) => state.ownerChecked);
  React.useEffect(() => setHydrated(true), []);
  return hydrated && ownerChecked;
};
