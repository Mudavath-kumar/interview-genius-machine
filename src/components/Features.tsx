
import { 
  FileCheck, 
  Mic, 
  BrainCircuit, 
  ListChecks, 
  UserRound, 
  Briefcase, 
  FileUp, 
  SlidersHorizontal, 
  MessageSquare 
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="feature-card">
    <div className="h-12 w-12 rounded-full bg-interview-teal/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-interview-blue">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features = () => {
  const jobSeekerFeatures = [
    {
      icon: <FileCheck className="h-6 w-6 text-interview-teal" />,
      title: "Resume Analysis",
      description: "Upload your resume to generate tailored questions based on your experience and skills."
    },
    {
      icon: <Mic className="h-6 w-6 text-interview-teal" />,
      title: "Voice-Based Answering",
      description: "Practice your responses with speech recognition and get real-time feedback."
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-interview-teal" />,
      title: "AI Feedback",
      description: "Receive personalized feedback on your answers to improve your interview skills."
    },
    {
      icon: <ListChecks className="h-6 w-6 text-interview-teal" />,
      title: "Question Categories",
      description: "Practice with technical, behavioral, situational, and competency-based questions."
    }
  ];
  
  const hrFeatures = [
    {
      icon: <UserRound className="h-6 w-6 text-interview-teal" />,
      title: "Candidate Assessment",
      description: "Generate relevant questions based on job descriptions and candidate resumes."
    },
    {
      icon: <Briefcase className="h-6 w-6 text-interview-teal" />,
      title: "Template Management",
      description: "Create and save question templates for different roles and departments."
    },
    {
      icon: <FileUp className="h-6 w-6 text-interview-teal" />,
      title: "Multi-Format Export",
      description: "Export questions in PDF, Word, or CSV formats for team collaboration."
    },
    {
      icon: <SlidersHorizontal className="h-6 w-6 text-interview-teal" />,
      title: "Difficulty Adjustment",
      description: "Customize question difficulty levels from easy to hard for comprehensive assessment."
    }
  ];
  
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Features for Everyone</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our system is designed to help both job seekers and HR professionals streamline the interview process.
          </p>
        </div>
        
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8 text-interview-blue">For Job Seekers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobSeekerFeatures.map((feature, index) => (
              <FeatureCard 
                key={`job-seeker-${index}`}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-center mb-8 text-interview-blue">For HR Professionals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hrFeatures.map((feature, index) => (
              <FeatureCard 
                key={`hr-${index}`}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
