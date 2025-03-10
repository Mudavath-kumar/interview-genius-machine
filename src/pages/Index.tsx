
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DemoGenerator from "@/components/DemoGenerator";
import Technology from "@/components/Technology";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <DemoGenerator />
      <Technology />
      
      <section className="py-20 bg-interview-teal text-white text-center">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Interview Process?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start generating customized interview questions for your next job application or recruitment drive.
          </p>
          <Button size="lg" className="bg-white text-interview-teal hover:bg-gray-100">
            Get Started Now
          </Button>
        </div>
      </section>
      
      <Footer />
      
      {showScrollTop && (
        <Button
          className="fixed bottom-6 right-6 bg-interview-blue hover:bg-interview-teal rounded-full h-12 w-12 p-0"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default Index;
