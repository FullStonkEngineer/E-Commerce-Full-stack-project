const PageContainer = ({ children }) => (
  <div className='min-h-screen relative overflow-hidden'>
    <div className='relative z-10 container mx-auto px-4 py-16'>{children}</div>
  </div>
);

export default PageContainer;
