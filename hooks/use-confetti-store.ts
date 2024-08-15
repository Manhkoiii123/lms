import { create } from "zustand";
type ConffettiStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};
export const useConfettiStore = create<ConffettiStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
