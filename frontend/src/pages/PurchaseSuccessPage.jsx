import { CheckCircle, ArrowRight, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import Confetti from "react-confetti";

import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import PrimaryButton from "../components/ui/PrimaryButton";

import { useCartStore } from "../stores/useCartStore";

const PurchaseSuccessPage = () => {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <PageContainer>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        numberOfPieces={700}
      />

      <div className='flex items-center justify-center'>
        <Card className='max-w-md w-full p-6 sm:p-8 text-center'>
          <CheckCircle className='mx-auto text-emerald-400 w-16 h-16 mb-4' />

          <h1 className='text-3xl font-bold text-emerald-400 mb-2'>
            Purchase Successful!
          </h1>

          <p className='text-gray-300 mb-6'>
            Thank you for your order. We’re processing it now.
          </p>

          <div className='space-y-4'>
            <PrimaryButton>
              <HandHeart className='mr-2' size={18} />
              Thanks for trusting us!
            </PrimaryButton>

            <Link
              to='/'
              className='flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded-lg transition'
            >
              Continue Shopping
              <ArrowRight className='ml-2' size={18} />
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default PurchaseSuccessPage;
