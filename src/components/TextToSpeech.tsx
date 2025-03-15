
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2, VolumeX, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import APIKeyNotification from "./APIKeyNotification";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { synthesizeSpeech } from "@/services/textToSpeechService";

interface TextToSpeechProps {
  text: string;
  voice?: string;
}

const TextToSpeech = ({ text, voice = "alloy" }: TextToSpeechProps) => {
  const [retries, setRetries] = useState(0);
  const [missingAPIKey, setMissingAPIKey] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  
  const { 
    isPlaying, 
    isLoading, 
    setIsLoading,
    playAudio, 
    stopAudio 
  } = useAudioPlayer();

  const handlePlay = useCallback(async () => {
    // If already playing, stop it
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (!text || text.trim() === "") {
      toast.error("No text provided for speech synthesis");
      return;
    }

    // Reset API key state
    setMissingAPIKey(false);
    setApiError(undefined);
    setIsLoading(true);
    
    try {
      const result = await synthesizeSpeech({ text, voice });
      
      if (result.missingAPIKey) {
        setMissingAPIKey(true);
        setApiError(result.error);
        setIsLoading(false);
        toast.error(result.error || "OpenAI API key is missing or invalid. Please check Supabase project secrets.");
        return;
      }

      if (result.error || !result.audio) {
        throw new Error(result.error || "Failed to generate audio");
      }

      await playAudio(result.audio);
      setRetries(0); // Reset retries on success
      
    } catch (err: any) {
      console.error("Error in text-to-speech:", err);
      
      // Attempt to retry if we haven't exceeded our retry limit
      if (retries < 1) {
        console.log(`Retrying... (${retries + 1}/1)`);
        setRetries(prev => prev + 1);
        toast.info("Retrying audio generation...");
        
        // Use setTimeout to avoid potential infinite loop
        setTimeout(() => {
          handlePlay();
        }, 1500);
        return;
      }
      
      toast.error("Failed to play audio. Please try again later.");
      setIsLoading(false);
    }
  }, [isPlaying, text, voice, retries, playAudio, stopAudio, setIsLoading]);

  return (
    <>
      {missingAPIKey && <APIKeyNotification error={apiError} />}
      <Button
        onClick={handlePlay}
        variant="outline"
        size="sm"
        disabled={isLoading || !text || text.trim() === ""}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : missingAPIKey ? (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        ) : isPlaying ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        {isLoading ? "Loading..." : 
          missingAPIKey ? "API Key Issue" : 
          isPlaying ? "Stop" : "Listen"}
      </Button>
    </>
  );
};

export default TextToSpeech;
