
import { supabase } from "@/integrations/supabase/client";

export type QuestionType = "technical" | "behavioral" | "situational" | "competency";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
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
