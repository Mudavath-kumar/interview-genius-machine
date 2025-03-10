
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-interview-blue">InterviewGenius</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-interview-teal transition-colors">
            Features
          </a>
          <a href="#demo" className="text-sm font-medium text-gray-600 hover:text-interview-teal transition-colors">
            Demo
          </a>
          <a href="#technology" className="text-sm font-medium text-gray-600 hover:text-interview-teal transition-colors">
            Technology
          </a>
          <Button variant="default" className="bg-interview-teal hover:bg-interview-blue">
            Get Started
          </Button>
        </nav>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>
      
      {isMenuOpen && (
        <div className="container md:hidden py-4 px-4">
          <nav className="flex flex-col space-y-4">
            <a 
              href="#features" 
              className="text-sm font-medium text-gray-600 hover:text-interview-teal transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#demo" 
              className="text-sm font-medium text-gray-600 hover:text-interview-teal transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo
            </a>
            <a 
              href="#technology" 
              className="text-sm font-medium text-gray-600 hover:text-interview-teal transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Technology
            </a>
            <Button variant="default" className="bg-interview-teal hover:bg-interview-blue w-full">
              Get Started
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
