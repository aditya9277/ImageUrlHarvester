import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { parseUrls, isValidUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNotification } from "@/hooks/use-notification";
import { SearchIcon } from "lucide-react";

interface UrlFormProps {
  onScrapeStart: () => void;
  onScrapeComplete: (data: any) => void;
  onScrapeError: () => void;
}

export function UrlForm({ onScrapeStart, onScrapeComplete, onScrapeError }: UrlFormProps) {
  const [urls, setUrls] = useState("");
  const [urlError, setUrlError] = useState("");
  const [options, setOptions] = useState({
    deduplicateImages: true,
    filterSmallImages: true,
  });
  const { showNotification } = useNotification();

  const scrapeImages = useMutation({
    mutationFn: async (data: { urls: string[]; options: typeof options }) => {
      const response = await apiRequest("POST", "/api/scrape", data);
      return response.json();
    },
    onSuccess: (data) => {
      onScrapeComplete(data);
      showNotification({
        type: "success",
        title: "Success!",
        message: `Found ${data.images.length} images from your URLs.`,
      });
    },
    onError: (error) => {
      onScrapeError();
      showNotification({
        type: "error",
        title: "Scraping failed",
        message: error instanceof Error ? error.message : "Failed to scrape images. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URLs
    const parsedUrls = parseUrls(urls);
    
    if (parsedUrls.length === 0) {
      setUrlError("Please enter at least one URL");
      return;
    }
    
    const invalidUrls = parsedUrls.filter(url => !isValidUrl(url));
    if (invalidUrls.length > 0) {
      setUrlError(`Invalid URL${invalidUrls.length > 1 ? 's' : ''}: ${invalidUrls.join(', ')}`);
      return;
    }
    
    setUrlError("");
    onScrapeStart();
    
    scrapeImages.mutate({
      urls: parsedUrls,
      options,
    });
  };

  return (
    <section className="bg-white rounded-xl shadow-md p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="urls" className="mb-1">
            Website URLs <span className="text-gray-500 text-xs">(one per line or comma-separated)</span>
          </Label>
          <Textarea
            id="urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={4}
            placeholder="https://example.com&#10;https://another-site.com"
            className={urlError ? "border-red-300 focus:border-red-500" : ""}
          />
          {urlError && (
            <div className="mt-1 text-sm text-red-600">
              {urlError}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="deduplicateImages" 
                checked={options.deduplicateImages}
                onCheckedChange={(checked) => {
                  setOptions(prev => ({ ...prev, deduplicateImages: checked === true }));
                }}
              />
              <Label 
                htmlFor="deduplicateImages" 
                className="text-sm text-gray-700 cursor-pointer"
                onClick={() => setOptions(prev => ({ ...prev, deduplicateImages: !prev.deduplicateImages }))}
              >
                Remove duplicates
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filterSmallImages" 
                checked={options.filterSmallImages}
                onCheckedChange={(checked) => {
                  setOptions(prev => ({ ...prev, filterSmallImages: checked === true }));
                }}
              />
              <Label 
                htmlFor="filterSmallImages" 
                className="text-sm text-gray-700 cursor-pointer"
                onClick={() => setOptions(prev => ({ ...prev, filterSmallImages: !prev.filterSmallImages }))}
              >
                Filter small images
              </Label>
            </div>
          </div>
          
          <Button 
            type="submit"
            disabled={scrapeImages.isPending}
            className="inline-flex items-center"
          >
            {scrapeImages.isPending ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <SearchIcon size={16} className="mr-2" />
            )}
            Scrape Images
          </Button>
        </div>
      </form>
    </section>
  );
}
