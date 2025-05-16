import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRightIcon, ImageIcon, LayersIcon, CheckCircleIcon, ZapIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <ImageIcon size={20} />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">ImageScraper</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className="text-primary"
              >
                Log in
              </Button>
            </Link>
            <Link href="/app">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0">
                Try Now
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Hackathon badge */}
          <div className="inline-block mb-6 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-full">
            🏆 Hackathon Edition
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Extract Images from Any Website Instantly
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            A powerful, modern tool that helps you extract, organize, and download images from multiple websites with just a few clicks.
          </p>
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/app">
              <Button size="lg" className="rounded-full px-8 text-lg h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all">
                Try It Now <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur shadow-sm rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">1000+</p>
              <p className="text-sm text-gray-500">Images Scraped</p>
            </div>
            <div className="bg-white/80 backdrop-blur shadow-sm rounded-lg p-4">
              <p className="text-3xl font-bold text-purple-600">95%</p>
              <p className="text-sm text-gray-500">Success Rate</p>
            </div>
            <div className="bg-white/80 backdrop-blur shadow-sm rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">100+</p>
              <p className="text-sm text-gray-500">Happy Users</p>
            </div>
            <div className="bg-white/80 backdrop-blur shadow-sm rounded-lg p-4">
              <p className="text-3xl font-bold text-purple-600">500ms</p>
              <p className="text-sm text-gray-500">Avg. Response</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                <LayersIcon className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-URL Scraping</h3>
              <p className="text-gray-600">
                Enter multiple URLs at once and scrape images from all websites simultaneously, saving you valuable time.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-purple-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                <CheckCircleIcon className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Deduplication</h3>
              <p className="text-gray-600">
                Automatically identifies and removes duplicate images, ensuring you only get unique content.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-green-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                <ZapIcon className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Optimized for speed with built-in caching technology to deliver results in seconds.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-yellow-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-yellow-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="M8 18v-1"></path><path d="M16 18v-3"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Bulk Download</h3>
              <p className="text-gray-600">
                Download all scraped images with a single click in a neatly organized ZIP archive.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-red-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-red-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Filtering</h3>
              <p className="text-gray-600">
                Filter out small or irrelevant images automatically to focus only on high-quality visual content.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-indigo-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-indigo-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">User Accounts</h3>
              <p className="text-gray-600">
                Create an account to save your scraping history and access your previously extracted images anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to extract images effortlessly?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto">
            Join thousands of users who are already saving time with our powerful image scraping tool.
          </p>
          <Link href="/app">
            <Button size="lg" variant="secondary" className="rounded-full px-8 text-lg h-12 text-blue-600 bg-white hover:bg-gray-100">
              Start Scraping Now <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-white/10 text-white p-2 rounded-lg">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">ImageScraper</h2>
            </div>
            
            <div className="text-sm">
              &copy; {new Date().getFullYear()} ImageScraper. All rights reserved. Built for Hackathon.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
