import CartItem from "./CartItem.jsx";

const CartItemsList = ({ cart }) => {
  return (
    <div className='space-y-6'>
      {cart.map((item) => (
        <CartItem key={item._id} item={item} />
      ))}
    </div>
  );
};

export default CartItemsList;
