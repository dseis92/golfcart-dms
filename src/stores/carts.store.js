import { create } from "zustand";
export const useCartsStore = create((set) => ({
  selected: null,
  select: (cart) => set({ selected: cart }),
  clear: () => set({ selected: null })
}));
