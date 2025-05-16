import { ImagesIcon } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-xl shadow-md">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
        <ImagesIcon className="text-2xl text-primary" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No images yet</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Enter website URLs above and click "Scrape Images" to extract all images from those sites.
      </p>
    </div>
  );
}
