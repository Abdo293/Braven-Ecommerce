// store.ts
import { Products } from "@/types/Products";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ShopState = {
  cart: (Products & { cartQty: number })[];
  wishlist: Products[];
  compare: Products[];

  addToCart: (product: Products, qty?: number) => void;
  removeFromCart: (id: string) => void;

  toggleWishlist: (product: Products) => void;
  toggleCompare: (product: Products) => void;

  clearCart: () => void;

  // UI state for cart sheet
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  increaseCartQty: (id: string) => void;
  decreaseCartQty: (id: string) => void;
  setCartQty: (id: string, qty: number) => void;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      compare: [],

      // دمج الكمية لو المنتج موجود
      addToCart: (product, qty = 1) => {
        const cart = get().cart;
        const idx = cart.findIndex((p) => p.id === product.id);
        if (idx > -1) {
          const updated = [...cart];
          updated[idx] = {
            ...updated[idx],
            cartQty: updated[idx].cartQty + qty,
          };
          set({ cart: updated });
        } else {
          set({ cart: [...cart, { ...product, cartQty: qty }] });
        }
      },

      removeFromCart: (id) =>
        set({ cart: get().cart.filter((p) => p.id !== id) }),

      toggleWishlist: (product) => {
        const { wishlist } = get();
        const exists = wishlist.find((p) => p.id === product.id);
        set({
          wishlist: exists
            ? wishlist.filter((p) => p.id !== product.id)
            : [...wishlist, product],
        });
      },

      toggleCompare: (product) => {
        const { compare } = get();
        const exists = compare.find((p) => p.id === product.id);
        set({
          compare: exists
            ? compare.filter((p) => p.id !== product.id)
            : [...compare, product],
        });
      },

      clearCart: () => set({ cart: [] }),

      isCartOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      increaseCartQty: (id) => {
        const cart = get().cart.map((p) => {
          if (p.id !== id) return p;
          const stock = typeof p.quantity === "number" ? p.quantity : Infinity; // المخزون لو موجود
          const next = Math.min((p.cartQty || 1) + 1, stock);
          return { ...p, cartQty: next };
        });
        set({ cart });
      },

      decreaseCartQty: (id) => {
        const cart = get().cart.map((p) =>
          p.id === id ? { ...p, cartQty: Math.max((p.cartQty || 1) - 1, 1) } : p
        );
        set({ cart });
      },

      setCartQty: (id, qty) => {
        const cart = get().cart.map((p) => {
          if (p.id !== id) return p;
          const stock = typeof p.quantity === "number" ? p.quantity : Infinity;
          const safe = Number.isFinite(qty)
            ? Math.max(1, Math.min(qty, stock))
            : 1;
          return { ...p, cartQty: safe };
        });
        set({ cart });
      },
    }),
    { name: "shop-storage" }
  )
);
