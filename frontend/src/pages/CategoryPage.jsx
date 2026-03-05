import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import LoadingSpinner from "../components/layout/LoadingSpinner";

import { useProductStore } from "../stores/useProductStore";
import CategoryLayout from "../components/category/CategoryLayout";

const CategoryPage = () => {
  const { fetchByCategory, loading } = useProductStore((state) => state);
  const { category } = useParams();

  useEffect(() => {
    fetchByCategory(category);
  }, [fetchByCategory, category]);

  if (loading) {
    return (
      <div className='text-center py-10'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <PageContainer>
      <CategoryLayout category={category} />
    </PageContainer>
  );
};

export default CategoryPage;
