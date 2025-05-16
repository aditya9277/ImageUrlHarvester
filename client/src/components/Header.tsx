import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { ImageIcon, HistoryIcon, LogOutIcon, LogInIcon, UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openLoginModal = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="bg-primary text-white p-2 rounded-lg">
                  <ImageIcon size={20} />
                </div>
                <h1 className="text-xl font-semibold text-gray-800">ImageScraper</h1>
              </div>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0">
                  <Avatar>
                    <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                    <AvatarFallback>{(user.firstName?.charAt(0) || "U") + (user.lastName?.charAt(0) || "")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/history">
                  <DropdownMenuItem className="cursor-pointer">
                    <HistoryIcon className="mr-2 h-4 w-4" />
                    <span>Scraping History</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                className="text-primary mr-2 flex items-center"
                onClick={handleLogin}
              >
                <LogInIcon size={16} className="mr-2" />
                Log in
              </Button>
              <Button 
                className="flex items-center"
                onClick={handleLogin}
              >
                <UserIcon size={16} className="mr-2" />
                Sign up
              </Button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
