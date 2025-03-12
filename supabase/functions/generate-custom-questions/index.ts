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

    const { questionType, difficultyLevel, jobDescription, resumeText, jobDescriptionId } = await req.json();

    console.log("Request payload:", { questionType, difficultyLevel, jobDescription, resumeText, jobDescriptionId });

    let questions;
    
    // If a job description ID is provided, fetch questions linked to that job description
    if (jobDescriptionId) {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          id,
          text,
          type_id,
          difficulty_id,
          sample_answer,
          job_descriptions(id, title, description, required_skills)
        `)
        .eq("job_description_id", jobDescriptionId)
        .limit(10);

      if (error) {
        console.error("Database error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch questions for job description" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      questions = data.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type_id,
        difficulty: q.difficulty_id,
        sample_answer: q.sample_answer,
        job_description: q.job_descriptions
      }));
    } else {
      // Otherwise, use the existing RPC function to generate questions by type and difficulty
      const { data, error } = await supabase.rpc(
        'generate_questions', 
        { 
          question_type: questionType,
          difficulty: difficultyLevel,
          limit_count: 10
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
      questions = data.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type_id,
        difficulty: q.difficulty_id,
        sample_answer: q.sample_answer
      }));
    }

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
