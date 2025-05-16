import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ScrapeHistory, Image as DBImage } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, DownloadIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultsSection } from "@/components/ResultsSection";
import { ImageData } from "@/components/ImageCard";
import { useEffect, useState } from "react";

interface HistoryDetailProps {
  id: string;
}

export default function HistoryDetail({ id }: HistoryDetailProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [images, setImages] = useState<ImageData[]>([]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Get the scrape history item
  const { data: historyData, isLoading: historyLoading } = useQuery<{ history: ScrapeHistory[] }>({
    queryKey: ["/api/history"],
    enabled: isAuthenticated,
  });

  // Find the specific scrape history item
  const scrapeItem = historyData?.history?.find(item => item.id === parseInt(id, 10));

  // Get the images for this scrape
  const { data: imagesData, isLoading: imagesLoading } = useQuery<{ images: DBImage[] }>({
    queryKey: [`/api/history/${id}/images`],
    enabled: isAuthenticated && !!scrapeItem,
    onSuccess: (data) => {
      // Convert DB images to ImageData format
      if (data?.images) {
        const formattedImages: ImageData[] = data.images.map(img => ({
          url: img.url,
          sourceUrl: img.sourceUrl,
          width: img.width || undefined,
          height: img.height || undefined,
          alt: img.alt || undefined,
          fileSize: img.fileSize || undefined,
          hash: img.hash || undefined,
          cached: img.cached || false,
        }));
        setImages(formattedImages);
      }
    }
  });

  const isLoading = authLoading || historyLoading || imagesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/history">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to History
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <>
            <div className="flex flex-col space-y-4 mb-8">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </>
        ) : !scrapeItem ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800">
                Scrape history not found. The item may have been deleted or you don't have permission to view it.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Scrape Results: {scrapeItem.urls.split(",")[0]} 
                {scrapeItem.urls.split(",").length > 1 && 
                  <span className="text-gray-500 text-lg font-normal"> and {scrapeItem.urls.split(",").length - 1} more</span>
                }
              </h1>
              <p className="text-sm text-gray-500">
                {scrapeItem.createdAt && format(new Date(scrapeItem.createdAt), "PPP 'at' p")} • 
                {scrapeItem.imageCount} images
              </p>
            </div>

            {images.length > 0 ? (
              <ResultsSection images={images} onClear={() => {}} />
            ) : (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-gray-600">No images available for this scrape.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}