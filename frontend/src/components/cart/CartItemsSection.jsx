import React from "react";
import { useCartStore } from "../../stores/useCartStore";

import CartItem from "./CartItem";
import EmptyCartUI from "./EmptyCartUI";
import PeopleAlsoBought from "./PeopleAlsoBought";

const CartItemsSection = () => {
  const { cart } = useCartStore();

  const hasItems = cart.length > 0;

  if (!hasItems) {
    return <EmptyCartUI />;
  }

  return (
    <>
      <div className='space-y-6'>
        {cart.map((item) => (
          <CartItem key={item._id} item={item} />
        ))}
      </div>

      <PeopleAlsoBought />
    </>
  );
};

export default CartItemsSection;
