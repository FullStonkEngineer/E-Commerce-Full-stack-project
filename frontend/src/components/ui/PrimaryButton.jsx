const PrimaryButton = ({ loading, children }) => (
  <button
    type='submit'
    disabled={loading}
    className='w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium
               text-white bg-emerald-600 hover:bg-emerald-700
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
               disabled:opacity-50 transition'
  >
    {children}
  </button>
);

export default PrimaryButton;
