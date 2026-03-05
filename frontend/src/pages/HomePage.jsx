import React, { useEffect } from "react";
import PageContainer from "../components/ui/PageContainer";
import HomeLayout from "../components/home/HomeLayout";

import { useProductStore } from "../stores/useProductStore";

const HomePage = () => {
  const { fetchFeaturedProducts } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <PageContainer>
      <HomeLayout />
    </PageContainer>
  );
};

export default HomePage;
