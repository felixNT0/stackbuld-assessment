"use client";

import { useAppData } from "@/context";
import { ProductItem } from "@/types/product";
import paths from "@/util/paths";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { cartData, removeFromCart } = useAppData();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const cartItems = Array.isArray(cartData) ? cartData : [];

  const router = useRouter();

  // Function to handle checkbox toggle
  const handleToggleSelect = (productId: string) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  // Function to handle modal close
  const closeModal = (event: any) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [onClose]);

  // Calculate total for selected items
  const total = useMemo(
    () =>
      cartItems
        .filter((item) => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + item.price, 0),
    [cartItems, selectedItems]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween" }}
            className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-lg overflow-y-auto"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold text-[#216869]">
                Your Cart
              </h2>
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item: ProductItem) => (
                  <li
                    key={item.id}
                    className="py-2 flex items-center justify-between text-[#216869]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      className="mr-2"
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="mx-2">${item.price.toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between font-semibold text-[#216869]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                className="mt-4 w-full bg-[#216869] text-white py-2 rounded-md hover:bg-[#1a544f] transition"
                disabled={selectedItems.length === 0}
                onClick={() => {
                  router.push(`${paths.app.checkout}/${total.toFixed(2)}`);
                }}
              >
                Checkout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
