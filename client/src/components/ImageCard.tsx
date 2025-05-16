import { formatBytes, getDomainFromUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DownloadIcon, ExternalLinkIcon, CheckCircleIcon, Loader2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface ImageData {
  url: string;
  sourceUrl: string;
  width?: number;
  height?: number;
  alt?: string;
  fileSize?: number;
  hash?: string;
  cached?: boolean;
}

interface ImageCardProps {
  image: ImageData;
}

export function ImageCard({ image }: ImageCardProps) {
  const domain = getDomainFromUrl(image.sourceUrl);
  const title = image.alt || "Image";
  const dimensions = image.width && image.height 
    ? `${image.width}×${image.height}` 
    : "Unknown dimensions";
  const size = image.fileSize ? formatBytes(image.fileSize) : null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    // Extract filename from URL or use a default
    const filename = image.url.split('/').pop() || 'image.jpg';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md">
      <a href={image.url} target="_blank" rel="noopener noreferrer" className="block relative">
        <img 
          src={image.url} 
          alt={image.alt || "Scraped image"} 
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="text-xs opacity-75">
            {dimensions}{size ? ` • ${size}` : ""} • {domain}
          </div>
        </div>
        {image.cached && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-white/90 text-xs px-2 py-0 flex items-center gap-1">
                    <CheckCircleIcon size={12} className="text-green-500" />
                    <span>Cached</span>
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">This image was loaded from cache for faster performance</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </a>
      <div className="px-3 py-2 flex justify-between items-center border-t border-gray-100">
        <span className="text-xs text-gray-500 truncate max-w-[180px]">{domain}</span>
        <div className="flex space-x-1">
          <button 
            onClick={handleDownload}
            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md"
            aria-label="Download image"
          >
            <DownloadIcon size={12} />
          </button>
          <a
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md"
            aria-label="Open image in new tab"
          >
            <ExternalLinkIcon size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
