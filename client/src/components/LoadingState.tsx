export function LoadingState() {
  // Generate an array of random heights for skeleton loaders
  const skeletonHeights = [
    "h-40", "h-64", "h-48", "h-56", 
    "h-40", "h-64", "h-48", "h-56"
  ];

  return (
    <div className="py-8 bg-white rounded-xl shadow-md">
      <div className="flex justify-center items-center mb-6">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
      <p className="text-center text-gray-700">Scraping images from your URLs...</p>
      
      <div className="masonry-grid mt-8 px-6">
        {skeletonHeights.map((height, index) => (
          <div 
            key={index}
            className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse ${height}`}
          />
        ))}
      </div>
    </div>
  );
}
