import React from "react";
import CategoryItem from "../domain/CategoryItem";
import { CATEGORIES } from "../../config/categories";

const categories = CATEGORIES;

const CategoriesSection = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16'>
      {categories.map((category) => (
        <CategoryItem category={category} key={category.name} />
      ))}
    </div>
  );
};

export default CategoriesSection;
