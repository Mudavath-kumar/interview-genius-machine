
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  QuestionType, 
  DifficultyLevel, 
  Question, 
  generateQuestions 
} from "@/services/questionService";
import VoiceRecorder from "@/components/VoiceRecorder";

const DemoGenerator = () => {
  const [activeTab, setActiveTab] = useState<string>("jobDescription");
  const [questionType, setQuestionType] = useState<QuestionType>("technical");
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>("medium");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: questions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['questions', questionType, difficultyLevel],
    queryFn: () => generateQuestions(questionType, difficultyLevel, 2),
    enabled: false, // Don't fetch automatically, wait for user action
  });

  const handleTypeChange = async (value: QuestionType) => {
    setQuestionType(value);
    if (difficultyLevel) {
      await refetch();
    }
  };

  const handleDifficultyChange = async (value: DifficultyLevel) => {
    setDifficultyLevel(value);
    if (questionType) {
      await refetch();
    }
  };

  const generateQuestionsHandler = async () => {
    try {
      // Reset the selected question when generating new questions
      setSelectedQuestionId(null);
      setTranscript(null);
      setFeedback(null);
      
      await refetch();
      toast.success("Questions generated successfully!");
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    }
  };

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestionId(questionId === selectedQuestionId ? null : questionId);
    // Reset transcript and feedback when selecting a new question
    setTranscript(null);
    setFeedback(null);
  };

  const handleTranscriptReady = (newTranscript: string, newFeedback: string) => {
    setTranscript(newTranscript);
    setFeedback(newFeedback);
  };

  const getSelectedQuestion = () => {
    return questions.find(q => q.id === selectedQuestionId);
  };

  if (error) {
    toast.error("An error occurred while fetching questions.");
  }

  return (
    <section id="demo" className="py-16">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Try Our Question Generator</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how our system generates customized interview questions based on job descriptions and resumes.
            Practice answering with voice recognition and get AI feedback!
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="jobDescription" onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jobDescription">Job Description</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
            </TabsList>
            <TabsContent value="jobDescription" className="mt-4">
              <Textarea 
                placeholder="Paste the job description here..." 
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="resume" className="mt-4">
              <Textarea 
                placeholder="Paste your resume text here..." 
                className="min-h-[200px]"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </TabsContent>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Question Type</label>
              <Select value={questionType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="situational">Situational</SelectItem>
                  <SelectItem value="competency">Competency-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <Select value={difficultyLevel} onValueChange={handleDifficultyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            className="w-full bg-interview-teal hover:bg-interview-blue mb-8"
            onClick={generateQuestionsHandler}
            disabled={isLoading || (activeTab === "jobDescription" && !jobDescription) || (activeTab === "resume" && !resumeText)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              "Generate Questions"
            )}
          </Button>
          
          {questions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Generated Questions</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click on a question to practice answering it with voice recognition.
              </p>
              <div className="space-y-4">
                {questions.map((question) => (
                  <Card 
                    key={question.id} 
                    className={`cursor-pointer transition-all ${selectedQuestionId === question.id ? 'ring-2 ring-interview-teal' : 'hover:shadow-md'}`}
                    onClick={() => handleQuestionSelect(question.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium px-2 py-1 rounded bg-interview-teal/10 text-interview-teal">
                          {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                        </span>
                        <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100">
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-800">{question.text}</p>
                      
                      {selectedQuestionId === question.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <VoiceRecorder 
                            questionId={question.id}
                            questionText={question.text}
                            questionType={question.type}
                            onTranscriptReady={handleTranscriptReady}
                          />
                          
                          {transcript && (
                            <div className="mt-4">
                              <h4 className="text-md font-semibold">Your Answer (Transcript):</h4>
                              <p className="mt-2 p-3 bg-gray-50 rounded">{transcript}</p>
                            </div>
                          )}
                          
                          {feedback && (
                            <div className="mt-4">
                              <h4 className="text-md font-semibold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                AI Feedback:
                              </h4>
                              <div className="mt-2 p-3 bg-interview-teal/10 rounded">
                                {feedback.split('\n').map((paragraph, index) => (
                                  <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DemoGenerator;
