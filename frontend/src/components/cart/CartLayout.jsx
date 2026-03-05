import React from "react";
import { motion } from "framer-motion";
import { slideUp } from "../../lib/animations";
import { useCartStore } from "../../stores/useCartStore";

import CartItemsSection from "./CartItemsSection";
import CartSidebar from "./CartSidebar";

const CartLayout = () => {
  const { cart } = useCartStore();
  const hasItems = cart.length > 0;

  return (
    <div className='mx-auto max-w-screen-xl px-4 2xl:px-0'>
      <h1 className='text-3xl font-bold text-emerald-400 mb-8'>Your Cart</h1>

      <div className='mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8'>
        <motion.div
          className='mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl'
          {...slideUp(0.5)}
        >
          <CartItemsSection />
        </motion.div>

        {hasItems && (
          <motion.div
            className='mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full'
            {...slideUp(0.5)}
          >
            <CartSidebar />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CartLayout;
