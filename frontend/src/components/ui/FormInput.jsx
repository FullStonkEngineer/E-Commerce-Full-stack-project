const baseInput =
  "block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md " +
  "placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm";

const FormInput = ({ label, icon: Icon, id, ...props }) => (
  <div>
    <label htmlFor={id} className='block text-sm font-medium text-gray-300'>
      {label}
    </label>
    <div className='mt-1 relative rounded-md shadow-sm'>
      {Icon && (
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Icon className='h-5 w-5 text-gray-400' />
        </div>
      )}
      <input
        id={id}
        className={`${baseInput} ${Icon ? "pl-10" : ""}`}
        {...props}
      />
    </div>
  </div>
);
export default FormInput;
