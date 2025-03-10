
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Save, FileDown, Trash } from "lucide-react";
import { toast } from "sonner";
import { 
  QuestionTemplate, 
  Question, 
  fetchTemplates, 
  fetchTemplateQuestions, 
  createTemplate, 
  addQuestionToTemplate, 
  generateQuestions 
} from "@/services/questionService";

const TemplateManager = () => {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null);
  const [templateQuestions, setTemplateQuestions] = useState<Question[]>([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadTemplates();
    loadSampleQuestions();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateQuestions(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templatesData = await fetchTemplates();
      setTemplates(templatesData);
      
      if (templatesData.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templatesData[0]);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplateQuestions = async (templateId: string) => {
    setIsLoading(true);
    try {
      const questionsData = await fetchTemplateQuestions(templateId);
      
      // Transform the data to match our Question interface
      const questions = questionsData.map(q => ({
        id: q.question_id,
        text: q.text,
        type: q.type_id,
        difficulty: q.difficulty_id
      }));
      
      setTemplateQuestions(questions);
    } catch (error) {
      console.error("Error loading template questions:", error);
      toast.error("Failed to load template questions");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleQuestions = async () => {
    try {
      // Generate a mix of questions for the HR to choose from
      const technicalQuestions = await generateQuestions("technical", "medium", 3);
      const behavioralQuestions = await generateQuestions("behavioral", "medium", 3);
      const situationalQuestions = await generateQuestions("situational", "medium", 3);
      
      setAvailableQuestions([
        ...technicalQuestions,
        ...behavioralQuestions,
        ...situationalQuestions
      ]);
    } catch (error) {
      console.error("Error loading sample questions:", error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    
    setIsCreating(true);
    try {
      const template = await createTemplate(newTemplateName, newTemplateDescription);
      setTemplates([...templates, template]);
      setSelectedTemplate(template);
      setNewTemplateName("");
      setNewTemplateDescription("");
      toast.success("Template created successfully");
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddQuestionToTemplate = async (question: Question) => {
    if (!selectedTemplate) {
      toast.error("No template selected");
      return;
    }
    
    try {
      await addQuestionToTemplate(
        selectedTemplate.id, 
        question.id, 
        templateQuestions.length // Use the current count as the order index
      );
      
      // Update the local state
      setTemplateQuestions([...templateQuestions, question]);
      toast.success("Question added to template");
    } catch (error) {
      console.error("Error adding question to template:", error);
      toast.error("Failed to add question to template");
    }
  };

  const handleExportTemplate = () => {
    if (!selectedTemplate || templateQuestions.length === 0) {
      toast.error("No template or questions to export");
      return;
    }
    
    // Create a formatted string of questions
    const questionsText = templateQuestions
      .map((q, index) => `${index + 1}. [${q.type.toUpperCase()}] ${q.text}`)
      .join('\n\n');
    
    const content = `
# ${selectedTemplate.name}
${selectedTemplate.description}

## Questions
${questionsText}
    `;
    
    // Create a blob and download it
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-template.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Templates List */}
      <div className="md:col-span-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Templates</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name</label>
                  <Input 
                    value={newTemplateName} 
                    onChange={(e) => setNewTemplateName(e.target.value)} 
                    placeholder="e.g., Frontend Developer Interview"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea 
                    value={newTemplateDescription} 
                    onChange={(e) => setNewTemplateDescription(e.target.value)} 
                    placeholder="Questions for assessing frontend development skills"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCreateTemplate} 
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Template
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading && templates.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500">No templates yet</p>
            <p className="text-sm text-gray-400 mt-1">Create a new template to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all ${selectedTemplate?.id === template.id ? 'ring-2 ring-interview-teal' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{template.name}</h4>
                  {template.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Template Questions */}
      <div className="md:col-span-8">
        {selectedTemplate ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedTemplate.name}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportTemplate}
                disabled={templateQuestions.length === 0}
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                Export
              </Button>
            </div>
            
            {selectedTemplate.description && (
              <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>
            )}
            
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-3">Template Questions</h4>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : templateQuestions.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-gray-50">
                  <p className="text-gray-500">No questions in this template</p>
                  <p className="text-sm text-gray-400 mt-1">Add questions from the available list below</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templateQuestions.map((question, index) => (
                    <Card key={question.id} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium px-2 py-1 rounded bg-interview-teal/10 text-interview-teal mr-2">
                            {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                        </div>
                        <p className="mt-2">{question.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-3">Available Questions</h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {availableQuestions.map((question) => (
                  <Card 
                    key={question.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => handleAddQuestionToTemplate(question)}
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
                      <p>{question.text}</p>
                      <div className="mt-2 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-interview-teal hover:text-interview-blue"
                        >
                          Add to Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] border rounded-lg bg-gray-50">
            <p className="text-gray-500">Select a template or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
