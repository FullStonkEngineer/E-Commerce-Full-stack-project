import React from "react";
import { useProductStore } from "../../stores/useProductStore";

import FeaturedProducts from "../domain/FeaturedProducts";

const FeaturedSection = () => {
  const { products, loading } = useProductStore();

  if (loading || !products?.length) return null;

  return <FeaturedProducts featuredProducts={products} />;
};

export default FeaturedSection;
