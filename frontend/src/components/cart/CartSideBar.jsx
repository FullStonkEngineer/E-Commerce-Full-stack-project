import React from "react";
import OrderSummary from "./OrderSummary";
import GiftCouponCard from "./GiftCouponCard";

const CartSidebar = () => {
  return (
    <>
      <OrderSummary />
      <GiftCouponCard />
    </>
  );
};

export default CartSidebar;
