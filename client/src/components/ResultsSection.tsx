import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageCard, ImageData } from "./ImageCard";
import { DownloadIcon, TrashIcon, FilterIcon, LayersIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import JSZip from "jszip";

// Add declaration for file-saver
declare module 'file-saver';
import { saveAs } from "file-saver";

interface ResultsSectionProps {
  images: ImageData[];
  onClear: () => void;
}

export function ResultsSection({ images, onClear }: ResultsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "width" | "height" | "size">("default");
  const [imagesPerPage, setImagesPerPage] = useState(20);
  
  // Count cached images
  const cachedImagesCount = images.filter(img => img.cached).length;
  
  // Group images by domain for filtering (fixed Set iteration)
  const domains = Array.from(new Set<string>(images.map(img => getDomain(img.sourceUrl))));
  
  // Filter images based on tab and search term
  let filteredImages = activeTab === "all" 
    ? images 
    : images.filter(img => getDomain(img.sourceUrl) === activeTab);
    
  // Apply search filter if search term exists
  if (searchTerm.trim() !== "") {
    const term = searchTerm.toLowerCase();
    filteredImages = filteredImages.filter(img => 
      (img.alt && img.alt.toLowerCase().includes(term)) ||
      img.url.toLowerCase().includes(term) ||
      img.sourceUrl.toLowerCase().includes(term)
    );
  }
  
  // Sort images
  if (sortBy !== "default") {
    filteredImages = [...filteredImages].sort((a, b) => {
      if (sortBy === "width") {
        return (b.width || 0) - (a.width || 0);
      } else if (sortBy === "height") {
        return (b.height || 0) - (a.height || 0);
      } else if (sortBy === "size") {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      return 0;
    });
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);
  
  function getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  // No longer needed as we now use custom pagination
  
  const downloadAllImages = async () => {
    const zip = new JSZip();
    const imgFolder = zip.folder("images");
    
    if (!imgFolder) return;
    
    // Add each image to the zip file
    const downloadPromises = filteredImages.map(async (image, index) => {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        
        // Create a filename based on the image URL or index
        const extension = image.url.split('.').pop() || 'jpg';
        const filename = `image_${index + 1}.${extension}`;
        
        imgFolder.file(filename, blob);
      } catch (error) {
        console.error(`Failed to download image: ${image.url}`, error);
      }
    });
    
    try {
      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "scraped_images.zip");
    } catch (error) {
      console.error("Failed to create zip file", error);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Found <span className="text-primary font-semibold">{images.length}</span> images
          </h3>
          {cachedImagesCount > 0 && (
            <div className="mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {cachedImagesCount} cached images
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Images loaded from cache for faster performance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <div className="flex space-x-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={downloadAllImages}
          >
            <DownloadIcon size={14} className="mr-1.5" />
            Download All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={onClear}
          >
            <TrashIcon size={14} className="mr-1.5" />
            Clear
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList className="border-b border-gray-200 bg-transparent overflow-x-auto max-w-full flex-nowrap whitespace-nowrap">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-1 bg-transparent border-b-2 border-transparent"
            >
              All Images
            </TabsTrigger>
            {domains.map(domain => (
              <TabsTrigger
                key={domain}
                value={domain}
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-1 bg-transparent border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              >
                {domain}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="max-w-xs h-8 pl-8"
              />
              <FilterIcon className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="h-8 w-[130px]">
                  <LayersIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="width">Width</SelectItem>
                  <SelectItem value="height">Height</SelectItem>
                  <SelectItem value="size">File size</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={imagesPerPage.toString()} 
                onValueChange={(value) => {
                  const newPerPage = parseInt(value);
                  setImagesPerPage(newPerPage);
                  setCurrentPage(1); // Reset to first page when changing per-page
                }}
              >
                <SelectTrigger className="h-8 w-[80px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <TabsContent value={activeTab} className="mt-0">
          {currentImages.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No images match your criteria</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {currentImages.map((image, index) => (
                <ImageCard key={`${image.url}_${index}`} image={image} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <div className="text-sm text-gray-700 text-center mb-4">
                Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredImages.length)}
                </span>{" "}
                of <span className="font-medium">{filteredImages.length}</span>{" "}
                images
              </div>
              
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center rounded-md p-2 text-sm ${
                      currentPage === 1 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  
                  {/* First page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                      currentPage === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                    }`}
                  >
                    1
                  </button>
                  
                  {/* Ellipsis if needed */}
                  {currentPage > 3 && (
                    <span className="flex h-8 w-8 items-center justify-center">
                      ...
                    </span>
                  )}
                  
                  {/* Pages around current */}
                  {Array.from({length: totalPages}).map((_, i) => {
                    const pageNumber = i + 1;
                    // Skip first and last page as they're always shown
                    if (pageNumber === 1 || pageNumber === totalPages) return null;
                    // Show pages around current page
                    if (
                      pageNumber >= Math.max(2, currentPage - 1) && 
                      pageNumber <= Math.min(totalPages - 1, currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                            currentPage === pageNumber ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Ellipsis if needed */}
                  {currentPage < totalPages - 2 && (
                    <span className="flex h-8 w-8 items-center justify-center">
                      ...
                    </span>
                  )}
                  
                  {/* Last page if more than 1 page */}
                  {totalPages > 1 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                        currentPage === totalPages ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                  
                  <button
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center rounded-md p-2 text-sm ${
                      currentPage === totalPages 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
