import { XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import { slideUp } from "../lib/animations.js";

const PurchaseCancelPage = () => {
  return (
    <PageContainer>
      <div className='flex items-center justify-center'>
        <motion.div {...slideUp(0.5)} className='w-full max-w-md'>
          <Card className='p-6 sm:p-8 text-center'>
            <XCircle className='mx-auto text-red-500 w-16 h-16 mb-4' />

            <h1 className='text-3xl font-bold text-red-500 mb-2'>
              Purchase Cancelled
            </h1>

            <p className='text-gray-300 mb-6'>
              Your order has been cancelled. No charges have been made.
            </p>

            <div className='bg-gray-700 rounded-lg p-4 mb-6'>
              <p className='text-sm text-gray-400'>
                If you encountered any issues during checkout, please contact
                our support team.
              </p>
            </div>

            <Link
              to='/'
              className='flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded-lg transition'
            >
              <ArrowLeft className='mr-2' size={18} />
              Return to Shop
            </Link>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default PurchaseCancelPage;
