import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { ImageIcon } from "lucide-react";

export function Header() {
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

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <ImageIcon size={20} />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">ImageScraper</h1>
          </div>
          <div>
            <Button 
              variant="ghost" 
              className="text-primary mr-2"
              onClick={openLoginModal}
            >
              Log in
            </Button>
            <Button 
              onClick={openSignupModal}
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode}
      />
    </>
  );
}
