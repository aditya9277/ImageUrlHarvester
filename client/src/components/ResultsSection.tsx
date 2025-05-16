import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageCard, ImageData } from "./ImageCard";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ResultsSectionProps {
  images: ImageData[];
  onClear: () => void;
}

export function ResultsSection({ images, onClear }: ResultsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const imagesPerPage = 20;
  
  // Group images by domain for filtering
  const domains = [...new Set(images.map(img => getDomain(img.sourceUrl)))];
  
  // Filter images based on activeTab
  const filteredImages = activeTab === "all" 
    ? images 
    : images.filter(img => getDomain(img.sourceUrl) === activeTab);
  
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Found <span className="text-primary font-semibold">{images.length}</span> images
        </h3>
        <div className="flex space-x-2">
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
        <TabsList className="border-b border-gray-200 mb-6 bg-transparent space-x-8">
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
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="masonry-grid">
            {currentImages.map((image, index) => (
              <ImageCard key={`${image.url}_${index}`} image={image} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredImages.length)}
                </span>{" "}
                of <span className="font-medium">{filteredImages.length}</span>{" "}
                images
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={currentPage === 1 ? "text-gray-400 cursor-not-allowed" : ""}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : ""}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
