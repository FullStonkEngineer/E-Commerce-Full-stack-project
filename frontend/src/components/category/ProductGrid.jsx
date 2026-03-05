import React from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../../stores/useProductStore";
import { slideUp } from "../../lib/animations.js";

import ProductCard from "../domain/ProductCard";

const ProductGrid = () => {
  const { products } = useProductStore();

  if (!products?.length) {
    return (
      <h2 className='text-3xl font-semibold text-gray-300 text-center'>
        No products found
      </h2>
    );
  }

  return (
    <motion.div
      className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
      {...slideUp(0.8)}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </motion.div>
  );
};

export default ProductGrid;
