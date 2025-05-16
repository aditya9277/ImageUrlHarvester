import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

interface ErrorStateProps {
  onTryAgain: () => void;
}

export function ErrorState({ onTryAgain }: ErrorStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-xl shadow-md">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
        <AlertTriangleIcon className="text-2xl text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Scraping failed</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        We couldn't scrape images from the provided URLs. Please check that the URLs are valid and try again.
      </p>
      <Button onClick={onTryAgain}>
        Try Again
      </Button>
    </div>
  );
}
