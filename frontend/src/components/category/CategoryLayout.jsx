import React from "react";
import { motion } from "framer-motion";
import ProductGrid from "./ProductGrid";
import { slideUp } from "../../lib/animations";

const CategoryLayout = ({ category }) => {
  const title = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
      <motion.h1
        className='text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8'
        {...slideUp(0.8)}
      >
        {title}
      </motion.h1>

      <ProductGrid />
    </div>
  );
};

export default CategoryLayout;
