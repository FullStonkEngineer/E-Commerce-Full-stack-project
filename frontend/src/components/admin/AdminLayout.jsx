import { motion } from "framer-motion";
import { slideUp } from "../../lib/animations.js";

const AdminLayout = ({ title, children }) => (
  <>
    <motion.h1
      className='text-4xl font-bold mb-8 text-emerald-400 text-center'
      {...slideUp(0.5)}
    >
      {title}
    </motion.h1>

    {children}
  </>
);

export default AdminLayout;
