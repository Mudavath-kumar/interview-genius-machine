
import { Button } from "@/components/ui/button";
import { ChevronRight, FileText, Mic, Users } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="gradient-text">Automated Interview</span> Question Generation System
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your interview preparation and recruitment processes with AI-generated customized questions tailored to job descriptions and candidate resumes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-interview-teal hover:bg-interview-blue">
              For Job Seekers
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-interview-teal text-interview-teal hover:bg-interview-teal/10">
              For HR Professionals
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <FileText className="h-6 w-6 text-interview-teal mr-2" />
              <span className="text-sm font-medium">Supports Multiple File Formats</span>
            </div>
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <Mic className="h-6 w-6 text-interview-teal mr-2" />
              <span className="text-sm font-medium">Voice-Based Answering</span>
            </div>
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <Users className="h-6 w-6 text-interview-teal mr-2" />
              <span className="text-sm font-medium">HR Collaboration Tools</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
