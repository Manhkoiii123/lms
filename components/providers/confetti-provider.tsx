"use client";
import Confetti from "react-confetti";
import { useConfettiStore } from "@/hooks/use-confetti-store";
const ConfettiProvider = () => {
  const { isOpen, onOpen, onClose } = useConfettiStore();
  if (!isOpen) return null;
  return (
    <Confetti
      className="pointer-events-none z-[100]"
      numberOfPieces={1000}
      recycle={false}
      onConfettiComplete={() => {
        onClose();
      }}
    />
  );
};
export default ConfettiProvider;
