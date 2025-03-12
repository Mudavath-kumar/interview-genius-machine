
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TextToSpeechProps {
  text: string;
  voice?: string;
}

const TextToSpeech = ({ text, voice = "alloy" }: TextToSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retries, setRetries] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const handlePlay = async () => {
    // If already playing, stop it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    cleanupAudio(); // Clean up any previous audio
    setIsLoading(true);
    
    try {
      // Truncate text for logging to avoid console clutter
      const truncatedText = text.length > 50 ? text.substring(0, 50) + "..." : text;
      console.log("Calling text-to-speech function with:", { text: truncatedText, voice });
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (!data || !data.audio) {
        console.error("Invalid response:", data);
        throw new Error(data?.error || "No audio data returned");
      }

      console.log("Received audio data of length:", data.audio.length);

      // Convert base64 to blob
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Set up event handlers
      audio.oncanplaythrough = () => {
        console.log("Audio ready to play");
        audio.play()
          .then(() => {
            console.log("Audio playback started successfully");
            setIsPlaying(true);
            setIsLoading(false);
            setRetries(0); // Reset retries on success
          })
          .catch(playError => {
            console.error("Error playing audio:", playError);
            toast.error("Failed to play audio. Please try again.");
            setIsLoading(false);
            cleanupAudio();
          });
      };
      
      audio.onerror = (e) => {
        console.error("Audio error:", e);
        toast.error("Error loading audio. Please try again.");
        setIsLoading(false);
        cleanupAudio();
      };
      
      audio.onended = () => {
        console.log("Audio playback completed");
        setIsPlaying(false);
        cleanupAudio();
      };
      
      // Handle potential timeout
      setTimeout(() => {
        if (isLoading) {
          console.warn("Audio loading timeout - resetting state");
          setIsLoading(false);
          cleanupAudio();
          toast.error("Audio loading timed out. Please try again.");
        }
      }, 15000); // 15 second timeout
      
    } catch (err: any) {
      console.error("Error processing audio:", err);
      
      // If we get a 500 error about the API key, show a specific message
      if (err.message?.includes("OpenAI API key is not configured")) {
        toast.error("OpenAI API key is not properly configured.");
        setIsLoading(false);
        return;
      }
      
      // Attempt to retry if we haven't exceeded our retry limit
      if (retries < 2) {
        console.log(`Retrying... (${retries + 1}/2)`);
        setRetries(prev => prev + 1);
        toast.info("Retrying audio generation...");
        setTimeout(() => handlePlay(), 1000);
        return;
      }
      
      toast.error("Failed to play audio. Please try again later.");
      setIsLoading(false);
      cleanupAudio();
    }
  };

  return (
    <Button
      onClick={handlePlay}
      variant="outline"
      size="sm"
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {isLoading ? "Loading..." : isPlaying ? "Stop" : "Listen"}
    </Button>
  );
};

export default TextToSpeech;
