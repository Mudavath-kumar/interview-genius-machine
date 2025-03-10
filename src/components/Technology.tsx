
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, FileText, Speech, FileCheck, MessageSquare } from "lucide-react";

const Technology = () => {
  const technologies = [
    {
      icon: <BrainCircuit className="h-10 w-10 text-interview-teal" />,
      title: "AI-Powered Analysis",
      description: "Our system leverages advanced AI models to analyze job descriptions and resumes, identifying key skills, requirements, and experience levels."
    },
    {
      icon: <FileText className="h-10 w-10 text-interview-teal" />,
      title: "Multi-Format Support",
      description: "Seamlessly extract data from multiple file formats including PDF, DOCX, and more for convenient data processing."
    },
    {
      icon: <Speech className="h-10 w-10 text-interview-teal" />,
      title: "Speech Recognition",
      description: "Practice interviews with voice-based answering capabilities using state-of-the-art speech recognition technology."
    },
    {
      icon: <FileCheck className="h-10 w-10 text-interview-teal" />,
      title: "Natural Language Processing",
      description: "Evaluate responses against ideal answers using NLP techniques to provide meaningful feedback for improvement."
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-interview-teal" />,
      title: "Dynamic Follow-up Questions",
      description: "Generate contextual follow-up questions based on previous answers to simulate realistic interview scenarios."
    }
  ];
  
  return (
    <section id="technology" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Advanced Technology</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our interview question generation system uses cutting-edge technology to provide the most accurate and helpful experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {technologies.map((tech, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-4">
                  {tech.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-interview-blue">{tech.title}</h3>
                <p className="text-gray-600">{tech.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Future enhancements will include multi-language support and integration with advanced AI models for even more nuanced functionality.
          </p>
          <div className="inline-flex items-center justify-center p-4 bg-interview-teal/10 text-interview-teal rounded-lg">
            <BrainCircuit className="h-5 w-5 mr-2" />
            <span className="font-medium">Continuously evolving with the latest AI advancements</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
