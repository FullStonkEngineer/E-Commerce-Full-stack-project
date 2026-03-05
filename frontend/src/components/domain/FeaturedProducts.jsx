import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({ featuredProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => prev + itemsPerPage);
  const prevSlide = () => setCurrentIndex((prev) => prev - itemsPerPage);

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

  if (!featuredProducts?.length) return null;

  return (
    <div className='py-12'>
      <h2 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-8'>
        Featured
      </h2>

      <div className='relative'>
        <div className='overflow-hidden'>
          <div
            className='flex transition-transform duration-300 ease-in-out'
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
            }}
          >
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2'
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prevSlide}
          disabled={isStartDisabled}
          className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition ${
            isStartDisabled
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          <ChevronLeft className='w-6 h-6 text-white' />
        </button>

        <button
          onClick={nextSlide}
          disabled={isEndDisabled}
          className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition ${
            isEndDisabled
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          <ChevronRight className='w-6 h-6 text-white' />
        </button>
      </div>
    </div>
  );
};

export default FeaturedProducts;
