
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UseAudioPlayerProps {
  onComplete?: () => void;
}

export const useAudioPlayer = ({ onComplete }: UseAudioPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const playAudio = (audioData: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Clean up any previous audio resources
      cleanupResources();
      
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      try {
        // Convert base64 to blob
        const binaryString = atob(audioData);
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
          if (signal.aborted) return reject(new Error("Playback was aborted"));
          
          console.log("Audio loaded and ready to play");
          audio.play()
            .then(() => {
              if (signal.aborted) return reject(new Error("Playback was aborted"));
              
              console.log("Audio playback started successfully");
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(playError => {
              if (signal.aborted) return reject(new Error("Playback was aborted"));
              
              console.error("Error playing audio:", playError);
              toast.error("Failed to play audio. Please try again.");
              setIsLoading(false);
              cleanupResources();
              reject(playError);
            });
        }, { once: true });
        
        audio.addEventListener('error', (e) => {
          if (signal.aborted) return reject(new Error("Playback was aborted"));
          
          const error = (e.target as HTMLAudioElement).error;
          console.error("Audio error:", error?.message || "Unknown error");
          toast.error("Error loading audio. Please try again.");
          setIsLoading(false);
          cleanupResources();
          reject(new Error(error?.message || "Unknown audio error"));
        }, { once: true });
        
        audio.addEventListener('ended', () => {
          if (signal.aborted) return;
          
          console.log("Audio playback completed");
          setIsPlaying(false);
          cleanupResources();
          onComplete?.();
          resolve();
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
            reject(new Error("Audio loading timeout"));
          }
        }, 15000); // 15 second timeout
        
        // Clear timeout when audio loads or component unmounts
        const clearTimeoutFunc = () => clearTimeout(timeout);
        audio.addEventListener('canplaythrough', clearTimeoutFunc, { once: true });
        
      } catch (err: any) {
        console.error("Error processing audio:", err);
        setIsLoading(false);
        cleanupResources();
        reject(err);
      }
    });
  };

  const stopAudio = () => {
    if (isPlaying && audioRef.current) {
      cleanupResources();
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    isLoading,
    setIsLoading,
    playAudio,
    stopAudio,
    cleanupResources
  };
};
