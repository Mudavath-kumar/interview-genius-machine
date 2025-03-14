
import { supabase } from "@/integrations/supabase/client";

interface TextToSpeechOptions {
  text: string;
  voice?: string;
}

interface TextToSpeechResponse {
  audio?: string;
  error?: string;
  missingAPIKey?: boolean;
}

export const synthesizeSpeech = async ({ 
  text, 
  voice = "alloy" 
}: TextToSpeechOptions): Promise<TextToSpeechResponse> => {
  try {
    console.log(`Calling text-to-speech function with: "${text.substring(0, 50)}..." and voice: ${voice}`);
    
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text, voice }
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Supabase function error: ${error.message}`);
    }

    if (data?.error === "OpenAI API key is not configured") {
      return { 
        missingAPIKey: true,
        error: "OpenAI API key is not configured. Please add it to your Supabase project secrets."
      };
    }

    if (!data || !data.audio) {
      console.error("Invalid response:", data);
      return { 
        error: data?.error || "No audio data returned" 
      };
    }

    console.log("Received audio data of length:", data.audio.length);
    return { audio: data.audio };
    
  } catch (err: any) {
    console.error("Error synthesizing speech:", err);
    
    // Check if error is related to API key
    if (err.message?.includes("OpenAI API key is not configured") || 
        err.message?.includes("OpenAI API key")) {
      return {
        missingAPIKey: true,
        error: err.message
      };
    }
    
    return { error: err.message };
  }
};
