
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
      return { error: `Function error: ${error.message}` };
    }

    // Check if the response contains error related to API key
    if (data?.error && (
        data.error.includes("API key") || 
        data.error.includes("quota") ||
        data.error.includes("authentication")
    )) {
      console.error("API key related error:", data.error);
      return { 
        missingAPIKey: true,
        error: data.error || "OpenAI API key is invalid or missing"
      };
    }

    if (!data || !data.audio) {
      console.error("Invalid response:", data);
      return { error: data?.error || "No audio data returned" };
    }

    console.log("Received audio data of length:", data.audio.length);
    return { audio: data.audio };
    
  } catch (err: any) {
    console.error("Error synthesizing speech:", err);
    
    // Check if error is related to API key
    if (err.message?.includes("API key") || 
        err.message?.toLowerCase().includes("authentication") || 
        err.message?.toLowerCase().includes("auth") ||
        err.message?.toLowerCase().includes("quota")) {
      return {
        missingAPIKey: true,
        error: err.message
      };
    }
    
    return { error: err.message };
  }
};
