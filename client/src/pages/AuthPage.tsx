import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { ImageIcon } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  
  // If user is already logged in, redirect to home page
  if (user && !isLoading) {
    return <Redirect to="/app" />;
  }
  
  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };
  
  const handleSubmit = (data: any) => {
    if (mode === "login") {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <ImageIcon size={20} />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">ImageScraper</h1>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Auth Form Section */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <AuthForm
              mode={mode}
              onSubmit={handleSubmit}
              isLoading={mode === "login" ? loginMutation.isPending : registerMutation.isPending}
              error={
                mode === "login" 
                  ? loginMutation.error?.message || null
                  : registerMutation.error?.message || null
              }
              onToggleMode={toggleMode}
            />
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 flex items-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Extract Images from Any Website Instantly
            </h2>
            <p className="text-lg mb-6 text-blue-100">
              Our powerful tool allows you to scrape and organize images from multiple websites with just a few clicks.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Multi-URL support for batch processing
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Smart deduplication removes duplicates
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Bulk download all images at once
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Save history and access it anytime
              </li>
            </ul>
            
            <div className="text-sm text-blue-200">
              {mode === "login" ? 
                "Sign in to access your saved scraping history and get more features" :
                "Create an account to save your scraping history and unlock premium features"
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}