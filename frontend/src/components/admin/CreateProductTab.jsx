import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

import { useProductStore } from "../../stores/useProductStore";
import { fileToBase64 } from "../../lib/imageToBase64";

import Card from "../ui/Card";
import CardHeader from "../ui/CardHeader";
import FormInput from "../ui/FormInput";
import PrimaryButton from "../ui/PrimaryButton";
import { slideUp } from "../../lib/animations.js";

const categories = [
  "jeans",
  "tshirts",
  "shoes",
  "glasses",
  "jackets",
  "suits",
  "bags",
];

const CreateProductTab = () => {
  const { createProduct, loading } = useProductStore();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const handleChange = (field) => (e) =>
    setProduct((p) => ({ ...p, [field]: e.target.value }));

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setProduct((p) => ({ ...p, image: base64 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProduct(product);
    toast.success("Product created");
  };

  return (
    <motion.div {...slideUp()}>
      <Card className='p-8 max-w-xl mx-auto'>
        <CardHeader title='Create New Product' />

        <form onSubmit={handleSubmit} className='space-y-4'>
          <FormInput
            label='Product name'
            value={product.name}
            onChange={handleChange("name")}
            required
          />

          <FormInput
            label='Description'
            as='textarea'
            value={product.description}
            onChange={handleChange("description")}
            required
          />

          <FormInput
            label='Price'
            type='number'
            step='0.01'
            value={product.price}
            onChange={handleChange("price")}
            required
          />

          <select
            className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white'
            value={product.category}
            onChange={handleChange("category")}
            required
          >
            <option value=''>Select category</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <label className='cursor-pointer text-gray-300'>
            <Upload className='inline mr-2' />
            Upload image
            <input type='file' hidden accept='image/*' onChange={handleImage} />
          </label>

          <PrimaryButton loading={loading}>
            {loading ? (
              <>
                <Loader className='mr-2 animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className='mr-2' />
                Create Product
              </>
            )}
          </PrimaryButton>
        </form>
      </Card>
    </motion.div>
  );
};

export default CreateProductTab;
