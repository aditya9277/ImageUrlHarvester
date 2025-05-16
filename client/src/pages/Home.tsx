import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { UrlForm } from "@/components/UrlForm";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ResultsSection } from "@/components/ResultsSection";
import { ErrorState } from "@/components/ErrorState";
import { ImageData } from "@/components/ImageCard";

type PageState = "empty" | "loading" | "results" | "error";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("empty");
  const [images, setImages] = useState<ImageData[]>([]);

  const handleScrapeStart = () => {
    setPageState("loading");
  };

  const handleScrapeComplete = (data: { images: ImageData[] }) => {
    setImages(data.images);
    setPageState(data.images.length > 0 ? "results" : "empty");
  };

  const handleScrapeError = () => {
    setPageState("error");
  };

  const handleClearResults = () => {
    setImages([]);
    setPageState("empty");
  };

  const handleTryAgain = () => {
    setPageState("empty");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
        
        <UrlForm 
          onScrapeStart={handleScrapeStart}
          onScrapeComplete={handleScrapeComplete}
          onScrapeError={handleScrapeError}
        />
        
        <section>
          {pageState === "empty" && <EmptyState />}
          {pageState === "loading" && <LoadingState />}
          {pageState === "results" && (
            <ResultsSection 
              images={images} 
              onClear={handleClearResults} 
            />
          )}
          {pageState === "error" && (
            <ErrorState onTryAgain={handleTryAgain} />
          )}
        </section>
      </main>
    </div>
  );
}
