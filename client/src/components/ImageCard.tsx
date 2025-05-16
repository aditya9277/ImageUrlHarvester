import { getDomainFromUrl } from "@/lib/utils";
import { DownloadIcon, ExternalLinkIcon } from "lucide-react";

export interface ImageData {
  url: string;
  sourceUrl: string;
  width?: number;
  height?: number;
  alt?: string;
  fileSize?: number;
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
          <div className="text-xs opacity-75">{dimensions} • {domain}</div>
        </div>
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
