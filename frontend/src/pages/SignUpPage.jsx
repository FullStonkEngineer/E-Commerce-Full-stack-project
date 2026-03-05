import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

import FormCard from "../components/ui/FormCard.jsx";
import FormInput from "../components/ui/FormInput.jsx";
import PrimaryButton from "../components/ui/PrimaryButton.jsx";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, loading } = useUserStore();

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(formData);
  };

  return (
    <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <motion.h2
        className='mt-6 text-center text-3xl font-extrabold text-emerald-400 py-8'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Create your account
      </motion.h2>

      <motion.div
        className='sm:mx-auto sm:w-full sm:max-w-md'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FormCard>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <FormInput
              id='name'
              label='Full name'
              icon={User}
              type='text'
              required
              value={formData.name}
              onChange={handleChange("name")}
              placeholder='John Doe'
            />

            <FormInput
              id='email'
              label='Email address'
              icon={Mail}
              type='email'
              required
              value={formData.email}
              onChange={handleChange("email")}
              placeholder='you@example.com'
            />

            <FormInput
              id='password'
              label='Password'
              icon={Lock}
              type='password'
              required
              value={formData.password}
              onChange={handleChange("password")}
              placeholder='••••••••'
            />

            <FormInput
              id='confirmPassword'
              label='Confirm password'
              icon={Lock}
              type='password'
              required
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder='••••••••'
            />

            <PrimaryButton loading={loading}>
              {loading ? (
                <>
                  <Loader className='mr-2 h-5 w-5 animate-spin' />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className='mr-2 h-5 w-5' />
                  Sign up
                </>
              )}
            </PrimaryButton>
          </form>

          <p className='mt-8 text-center text-sm text-gray-400'>
            Already have an account?{" "}
            <Link
              to='/login'
              className='text-emerald-400 hover:text-emerald-300'
            >
              Login here <ArrowRight className='inline h-4 w-4' />
            </Link>
          </p>
        </FormCard>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
