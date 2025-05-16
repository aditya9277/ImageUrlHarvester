import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ScrapeHistory } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ExternalLinkIcon, ImageIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to home if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate("/");
    return null;
  }

  const { data, isLoading, error } = useQuery<{ history: ScrapeHistory[] }>({
    queryKey: ["/api/history"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Scraping History</h1>
          <Link href="/">
            <Button>New Scrape</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800">
                There was an error loading your history. Please try again later.
              </p>
            </CardContent>
          </Card>
        ) : !data?.history?.length ? (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6 text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <ImageIcon className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No scraping history yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Start scraping images to build your history. All your scrapes will be saved here for easy access.
              </p>
              <Link href="/">
                <Button>Start Scraping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.history.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-primary/5 border-b border-gray-100">
                  <CardTitle className="text-lg flex justify-between">
                    <span className="truncate">{item.urls.split(",")[0]}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {item.urls.split(",").length > 1 ? `+${item.urls.split(",").length - 1} more` : ""}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>{item.createdAt ? format(new Date(item.createdAt), "PPP 'at' p") : 'Unknown date'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      <span>{item.imageCount} images found</span>
                    </div>
                  </div>
                  <Link href={`/history/${item.id}`}>
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <ExternalLinkIcon className="mr-2 h-4 w-4" />
                      View Results
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}