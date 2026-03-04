import { CheckCircle, ArrowRight, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useCartStore } from "../stores/useCartStore";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // UI concern only
    clearCart();
  }, [clearCart]);

  return (
    <div className='h-screen flex items-center justify-center px-4'>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        numberOfPieces={700}
      />

      <div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl'>
        <div className='p-6 sm:p-8'>
          <div className='flex justify-center'>
            <CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
          </div>

          <h1 className='text-2xl font-bold text-center text-emerald-400 mb-2'>
            Purchase Successful!
          </h1>

          <p className='text-gray-300 text-center mb-6'>
            Thank you for your order. We’re processing it now.
          </p>

          <div className='space-y-4'>
            <button className='w-full bg-emerald-600 py-2 rounded-lg flex justify-center'>
              <HandHeart className='mr-2' size={18} />
              Thanks for trusting us!
            </button>

            <Link
              to='/'
              className='w-full bg-gray-700 py-2 rounded-lg flex justify-center'
            >
              Continue Shopping
              <ArrowRight className='ml-2' size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
