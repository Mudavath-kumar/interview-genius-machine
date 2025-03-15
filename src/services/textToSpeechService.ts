
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

    // Check if the response contains error related to API key or quota
    if (data?.error) {
      console.error("API error:", data.error);
      
      const errorLower = data.error.toLowerCase();
      const isApiKeyOrQuotaError = errorLower.includes("api key") || 
                                 errorLower.includes("quota") ||
                                 errorLower.includes("exceeded") ||
                                 errorLower.includes("authentication") ||
                                 errorLower.includes("billing");
      
      if (isApiKeyOrQuotaError) {
        return { 
          missingAPIKey: true,
          error: data.error
        };
      }
      
      return { error: data.error };
    }

    if (!data || !data.audio) {
      console.error("Invalid response:", data);
      return { error: data?.error || "No audio data returned" };
    }

    console.log("Received audio data of length:", data.audio.length);
    return { audio: data.audio };
    
  } catch (err: any) {
    console.error("Error synthesizing speech:", err);
    
    // Check if error is related to API key or quota
    const errorMsg = err.message?.toLowerCase() || '';
    if (errorMsg.includes("api key") || 
        errorMsg.includes("authentication") || 
        errorMsg.includes("auth") ||
        errorMsg.includes("quota") ||
        errorMsg.includes("exceeded")) {
      return {
        missingAPIKey: true,
        error: err.message
      };
    }
    
    return { error: err.message };
  }
};
