const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-800 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

export default Card;
