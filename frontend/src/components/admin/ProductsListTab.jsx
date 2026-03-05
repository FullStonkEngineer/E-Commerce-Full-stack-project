import { motion } from "framer-motion";
import { Trash, Star } from "lucide-react";
import { useProductStore } from "../../stores/useProductStore";

import Card from "../ui/Card";
import Table from "../ui/Table";
import PrimaryIconButton from "../ui/PrimaryIconButton";
import { slideUp } from "../../lib/animations.js";

const headers = ["Product", "Price", "Category", "Featured", "Actions"];

const ProductsListTab = () => {
  const { products, deleteProduct, toggleFeatured } = useProductStore();

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      deleteProduct(id);
    }
  };

  return (
    <motion.div {...slideUp()}>
      <Card className='overflow-hidden max-w-4xl mx-auto'>
        <Table headers={headers}>
          {products?.map((product) => (
            <tr key={product._id} className='hover:bg-gray-700'>
              <td className='px-6 py-4 flex items-center'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='h-10 w-10 rounded-full object-cover'
                />
                <span className='ml-4 text-white font-medium'>
                  {product.name}
                </span>
              </td>

              <td className='px-6 py-4 text-gray-300'>
                ${product.price.toFixed(2)}
              </td>

              <td className='px-6 py-4 text-gray-300'>{product.category}</td>

              <td className='px-6 py-4'>
                <PrimaryIconButton
                  onClick={() => toggleFeatured(product._id)}
                  variant={product.isFeatured ? "highlight" : "default"}
                >
                  <Star className='h-5 w-5' />
                </PrimaryIconButton>
              </td>

              <td className='px-6 py-4'>
                <PrimaryIconButton
                  onClick={() => handleDelete(product._id)}
                  variant='danger'
                >
                  <Trash className='h-5 w-5' />
                </PrimaryIconButton>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </motion.div>
  );
};

export default ProductsListTab;
