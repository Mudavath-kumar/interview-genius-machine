
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2, VolumeX, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import APIKeyNotification from "./APIKeyNotification";

interface TextToSpeechProps {
  text: string;
  voice?: string;
}

const TextToSpeech = ({ text, voice = "alloy" }: TextToSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retries, setRetries] = useState(0);
  const [missingAPIKey, setMissingAPIKey] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  const cleanupResources = () => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop and clean up audio
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      } catch (e) {
        console.warn("Error cleaning up audio element:", e);
      }
      audioRef.current = null;
    }
    
    // Revoke object URL to prevent memory leaks
    if (audioUrlRef.current) {
      try {
        URL.revokeObjectURL(audioUrlRef.current);
      } catch (e) {
        console.warn("Error revoking object URL:", e);
      }
      audioUrlRef.current = null;
    }
  };

  const handlePlay = async () => {
    // If already playing, stop it
    if (isPlaying && audioRef.current) {
      cleanupResources();
      setIsPlaying(false);
      return;
    }

    // Reset missing API key state
    setMissingAPIKey(false);

    // Clean up any previous audio and prepare for new request
    cleanupResources();
    setIsLoading(true);
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      // Truncate text for logging to avoid console clutter
      const truncatedText = text.length > 50 ? text.substring(0, 50) + "..." : text;
      console.log("Calling text-to-speech function with:", { text: truncatedText, voice });
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Supabase function error: ${error.message}`);
      }

      if (data?.error === "OpenAI API key is not configured") {
        setMissingAPIKey(true);
        throw new Error("OpenAI API key is not configured. Please add it to your Supabase project secrets.");
      }

      if (!data || !data.audio) {
        console.error("Invalid response:", data);
        throw new Error(data?.error || "No audio data returned");
      }

      // Check if request was aborted during the API call
      if (signal.aborted) {
        console.log("Request was aborted, stopping processing");
        return;
      }

      console.log("Received audio data of length:", data.audio.length);

      // Convert base64 to blob
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      
      // Create URL and audio element
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      
      const audio = new Audio();
      audioRef.current = audio;
      
      // Set up event handlers
      audio.addEventListener('canplaythrough', () => {
        if (signal.aborted) return;
        
        console.log("Audio loaded and ready to play");
        audio.play()
          .then(() => {
            if (signal.aborted) return;
            
            console.log("Audio playback started successfully");
            setIsPlaying(true);
            setIsLoading(false);
            setRetries(0); // Reset retries on success
          })
          .catch(playError => {
            if (signal.aborted) return;
            
            console.error("Error playing audio:", playError);
            toast.error("Failed to play audio. Please try again.");
            setIsLoading(false);
            cleanupResources();
          });
      }, { once: true });
      
      audio.addEventListener('error', (e) => {
        if (signal.aborted) return;
        
        const error = (e.target as HTMLAudioElement).error;
        console.error("Audio error:", error?.message || "Unknown error");
        toast.error("Error loading audio. Please try again.");
        setIsLoading(false);
        cleanupResources();
      }, { once: true });
      
      audio.addEventListener('ended', () => {
        if (signal.aborted) return;
        
        console.log("Audio playback completed");
        setIsPlaying(false);
        cleanupResources();
      }, { once: true });
      
      // Load the audio
      audio.src = audioUrl;
      audio.load();
      
      // Set a timeout in case the audio never fires the canplaythrough event
      const timeout = setTimeout(() => {
        if (isLoading && !signal.aborted) {
          console.warn("Audio loading timeout - resetting state");
          setIsLoading(false);
          cleanupResources();
          toast.error("Audio loading timed out. Please try again.");
        }
      }, 15000); // 15 second timeout
      
      // Clear timeout when audio loads or component unmounts
      const clearTimeoutFunc = () => clearTimeout(timeout);
      audio.addEventListener('canplaythrough', clearTimeoutFunc, { once: true });
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeout);
      
    } catch (err: any) {
      if (signal.aborted) {
        console.log("Request was aborted during error handling");
        return;
      }
      
      console.error("Error processing audio:", err);
      
      // If we get a specific error about the API key, show a specific message
      if (err.message?.includes("OpenAI API key is not configured") || 
          err.message?.includes("OpenAI API key")) {
        setMissingAPIKey(true);
        toast.error("OpenAI API key is missing or invalid in Supabase. Please check your key.");
        setIsLoading(false);
        cleanupResources();
        return;
      }
      
      // Attempt to retry if we haven't exceeded our retry limit
      if (retries < 2) {
        console.log(`Retrying... (${retries + 1}/2)`);
        setRetries(prev => prev + 1);
        toast.info("Retrying audio generation...");
        
        // Use setTimeout to avoid potential infinite loop
        setTimeout(() => {
          if (!signal.aborted) {
            handlePlay();
          }
        }, 1500);
        return;
      }
      
      toast.error("Failed to play audio after multiple attempts. Please try again later.");
      setIsLoading(false);
      cleanupResources();
    }
  };

  return (
    <>
      {missingAPIKey && <APIKeyNotification />}
      <Button
        onClick={handlePlay}
        variant="outline"
        size="sm"
        disabled={isLoading}
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
          missingAPIKey ? "API Key Missing" : 
          isPlaying ? "Stop" : "Listen"}
      </Button>
    </>
  );
};

export default TextToSpeech;
