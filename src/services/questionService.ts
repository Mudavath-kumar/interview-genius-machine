
import { supabase } from "@/integrations/supabase/client";

export type QuestionType = "technical" | "behavioral" | "situational" | "competency";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
}

export interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface TemplateQuestion {
  question_id: string;
  text: string;
  type_id: QuestionType; // This needs to be QuestionType
  difficulty_id: DifficultyLevel; // This needs to be DifficultyLevel
  order_index: number;
}

export interface VoiceResponse {
  id: string;
  question_id: string;
  audio_url: string | null;
  transcript: string | null;
  feedback: string | null;
  created_at: string;
}

export const fetchQuestionTypes = async () => {
  const { data, error } = await supabase
    .from("question_types")
    .select("*");
  
  if (error) {
    console.error("Error fetching question types:", error);
    throw error;
  }
  
  return data;
};

export const fetchDifficultyLevels = async () => {
  const { data, error } = await supabase
    .from("difficulty_levels")
    .select("*");
  
  if (error) {
    console.error("Error fetching difficulty levels:", error);
    throw error;
  }
  
  return data;
};

export const generateQuestions = async (
  questionType: QuestionType,
  difficultyLevel: DifficultyLevel,
  count: number = 2
): Promise<Question[]> => {
  try {
    // Call the custom function we created in the migration
    const { data, error } = await supabase.rpc(
      'generate_questions', 
      { 
        question_type: questionType,
        difficulty: difficultyLevel,
        limit_count: count
      }
    );

    if (error) {
      console.error("Error generating questions:", error);
      throw error;
    }

    // Transform the data to match our Question interface
    return data.map((q: any) => ({
      id: q.id,
      text: q.text,
      type: q.type_id as QuestionType,
      difficulty: q.difficulty_id as DifficultyLevel
    }));
  } catch (error) {
    console.error("Error in generateQuestions:", error);
    throw error;
  }
};

export const saveVoiceResponse = async (
  questionId: string,
  audioUrl: string | null,
  transcript: string | null
): Promise<VoiceResponse> => {
  const { data, error } = await supabase
    .from("voice_responses")
    .insert({
      question_id: questionId,
      audio_url: audioUrl,
      transcript: transcript
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving voice response:", error);
    throw error;
  }

  return data;
};

export const generateFeedback = async (
  questionId: string,
  transcript: string
): Promise<string> => {
  // This would typically call an edge function that uses NLP to evaluate the response
  // For now, we'll just return a placeholder
  return "Great job! Your answer demonstrates good understanding of the topic.";
};

export const fetchTemplates = async (): Promise<QuestionTemplate[]> => {
  const { data, error } = await supabase
    .from("question_templates")
    .select("*");

  if (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }

  return data;
};

export const fetchTemplateQuestions = async (templateId: string): Promise<TemplateQuestion[]> => {
  const { data, error } = await supabase.rpc(
    'get_template_questions',
    { template_id: templateId }
  );

  if (error) {
    console.error("Error fetching template questions:", error);
    throw error;
  }

  // Cast the string types from the database to our union types
  return data.map((q: any) => ({
    ...q,
    type_id: q.type_id as QuestionType,
    difficulty_id: q.difficulty_id as DifficultyLevel
  }));
};

export const createTemplate = async (name: string, description: string): Promise<QuestionTemplate> => {
  const { data, error } = await supabase
    .from("question_templates")
    .insert({
      name,
      description
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating template:", error);
    throw error;
  }

  return data;
};

export const addQuestionToTemplate = async (
  templateId: string, 
  questionId: string, 
  orderIndex: number
): Promise<void> => {
  const { error } = await supabase
    .from("template_questions")
    .insert({
      template_id: templateId,
      question_id: questionId,
      order_index: orderIndex
    });

  if (error) {
    console.error("Error adding question to template:", error);
    throw error;
  }
};
