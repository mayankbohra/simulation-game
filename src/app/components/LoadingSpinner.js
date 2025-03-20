export default function LoadingSpinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'h-4 w-4 md:h-6 md:w-6 border-t-2 border-b-2 border-r-2',
    medium: 'h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-r-2',
    large: 'h-8 w-8 md:h-12 md:w-12 border-t-3 border-b-3 border-r-3'
  };

  return (
    <div className="flex justify-center items-center p-2 md:p-4">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-purple-500 border-r-transparent shadow-md`}>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
