import React from "react";
import PageContainer from "../components/ui/PageContainer.jsx";
import CartLayout from "../components/cart/CartLayout.jsx";
import LoadingSpinner from "../components/layout/LoadingSpinner.jsx";
import { useCartStore } from "../stores/useCartStore";

const CartPage = () => {
  const { loading } = useCartStore();

  if (loading)
    return (
      <div className='text-center py-10'>
        <LoadingSpinner />
      </div>
    );

  return (
    <PageContainer>
      <CartLayout />
    </PageContainer>
  );
};

export default CartPage;
