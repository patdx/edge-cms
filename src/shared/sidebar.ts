import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useSidebar = create(
  combine({ isOpen: false as boolean }, (set, get) => ({
    toggle: () => set({ isOpen: !get().isOpen }),
    close: () => set({ isOpen: false }),
    open: () => set({ isOpen: true }),
  }))
);
