
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobDescription, fetchJobDescriptions } from "@/services/questionService";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobDescriptionSelectProps {
  onSelect: (jobDescription: JobDescription) => void;
  selectedId?: string;
}

const JobDescriptionSelect = ({ onSelect, selectedId }: JobDescriptionSelectProps) => {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadJobDescriptions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchJobDescriptions();
        setJobDescriptions(data);
      } catch (err) {
        console.error("Error loading job descriptions:", err);
        setError("Failed to load job descriptions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJobDescriptions();
  }, []);

  // Filter job descriptions based on search term
  const filteredJobs = searchTerm 
    ? jobDescriptions.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.required_skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : jobDescriptions;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Select Job Description</h3>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search job titles, descriptions or skills..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((jd) => (
            <Card 
              key={jd.id} 
              className={`cursor-pointer transition-all ${
                selectedId === jd.id ? 'ring-2 ring-interview-teal' : 'hover:shadow-md'
              }`}
              onClick={() => onSelect(jd)}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold text-lg mb-2">{jd.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{jd.description}</p>
                <div className="flex flex-wrap gap-2">
                  {jd.required_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-4 text-gray-500">
            No job descriptions found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescriptionSelect;
