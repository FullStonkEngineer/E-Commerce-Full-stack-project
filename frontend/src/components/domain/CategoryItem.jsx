import React from "react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";

const CategoryItem = ({ category }) => {
  return (
    <Card className='relative overflow-hidden h-96 group cursor-pointer'>
      <Link to={`/category/${category.href.replace("/", "")}`}>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-50 z-10' />

        <img
          src={category.imageUrl}
          alt={category.name}
          className='w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110'
          loading='lazy'
        />

        <div className='absolute bottom-0 left-0 right-0 p-4 z-20'>
          <h3 className='text-white text-2xl font-bold mb-2'>
            {category.name}
          </h3>

          <p className='text-gray-200 text-sm'>Explore {category.name}</p>
        </div>
      </Link>
    </Card>
  );
};

export default CategoryItem;
