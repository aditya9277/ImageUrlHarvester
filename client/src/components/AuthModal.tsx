import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would handle authentication here
    console.log({ email, password, rememberMe });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div className="absolute top-0 right-0 pt-4 pr-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-md text-gray-400 hover:text-gray-500"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900">
            {mode === "login" ? "Login to Your Account" : "Create Your Account"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember-me" className="text-sm text-gray-900">
                  Remember me
                </Label>
              </div>
              
              {mode === "login" && (
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary-600">
                    Forgot your password?
                  </a>
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              {mode === "login" ? "Sign in" : "Sign up"}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <FaGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
