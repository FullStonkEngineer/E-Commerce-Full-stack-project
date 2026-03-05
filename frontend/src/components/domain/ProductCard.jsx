import React from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";

import Card from "../ui/Card";
import PrimaryButton from "../ui/PrimaryButton";

import { useUserStore } from "../../stores/useUserStore";
import { useCartStore } from "../../stores/useCartStore";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", {
        id: "cartLogin",
      });
      return;
    }

    addToCart(product);
  };

  return (
    <Card className='w-full max-w-sm overflow-hidden'>
      <div className='relative h-60 overflow-hidden rounded-lg'>
        <img
          className='object-cover w-full h-full'
          src={product.image}
          alt={product.name}
        />

        <div className='absolute inset-0 bg-black bg-opacity-20' />
      </div>

      <div className='mt-4 space-y-4'>
        <h5 className='text-xl font-semibold text-white'>{product.name}</h5>

        <div className='flex items-center justify-between'>
          <span className='text-3xl font-bold text-emerald-400'>
            ${product.price}
          </span>
        </div>

        <PrimaryButton onClick={handleAddToCart}>
          <span className='flex items-center justify-center gap-2'>
            <ShoppingCart size={20} />
            Add to Cart
          </span>
        </PrimaryButton>
      </div>
    </Card>
  );
};

export default ProductCard;
