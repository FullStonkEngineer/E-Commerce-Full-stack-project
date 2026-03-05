import React from "react";
import CategoriesSection from "./CategoriesSection";
import FeaturedSection from "./FeaturedSection";

const HomeLayout = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
      <h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
        Explore Our Categories
      </h1>

      <p className='text-center text-xl text-gray-300 mb-12'>
        Discover the latest trends in eco-friendly fashion
      </p>

      <CategoriesSection />

      <FeaturedSection />
    </div>
  );
};

export default HomeLayout;
