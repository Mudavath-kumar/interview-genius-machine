
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-interview-blue text-white">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">InterviewGenius</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Automated Interview Question Generation System designed to streamline interview preparation and recruitment processes.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              </li>
              <li>
                <a href="#demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
              </li>
              <li>
                <a href="#technology" className="text-gray-300 hover:text-white transition-colors">Technology</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Stay Updated</h4>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex space-x-2">
              <Input 
                placeholder="Your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button className="bg-interview-light-teal hover:bg-interview-pale-blue text-interview-blue font-medium">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} InterviewGenius. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
