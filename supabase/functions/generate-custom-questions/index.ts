
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { questionType, difficultyLevel, jobDescription, resumeText } = await req.json();

    console.log("Request payload:", { questionType, difficultyLevel, jobDescription, resumeText });

    // For now, we'll simply fetch questions from the database based on type and difficulty
    // In a real implementation, you might use AI to analyze the job description and resume
    const { data, error } = await supabase.rpc(
      'generate_questions', 
      { 
        question_type: questionType,
        difficulty: difficultyLevel,
        limit_count: 2
      }
    );

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate questions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Transform the data to match the frontend Question interface
    const questions = data.map((q: any) => ({
      id: q.id,
      text: q.text,
      type: q.type_id,
      difficulty: q.difficulty_id
    }));

    console.log(`Generated ${questions.length} questions`);

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
