const PrimaryIconButton = ({ onClick, children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-600 text-gray-300 hover:bg-gray-500",
    danger: "text-red-400 hover:text-red-300",
    highlight: "bg-yellow-400 text-gray-900 hover:bg-yellow-500",
  };

  return (
    <button
      onClick={onClick}
      className={`p-1 rounded-full transition-colors duration-200 ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

export default PrimaryIconButton;
