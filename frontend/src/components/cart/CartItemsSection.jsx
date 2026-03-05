import React from "react";
import { useCartStore } from "../../stores/useCartStore";

import CartItem from "../domain/CartItem";
import EmptyCartUI from "../domain/EmptyCartUI";
import PeopleAlsoBought from "../domain/PeopleAlsoBought";

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
