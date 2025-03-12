
import { useState } from "react";
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
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    // If already playing, stop it
    if (isPlaying && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (!data || !data.audio) {
        console.error("Invalid response:", data);
        throw new Error("No audio data returned");
      }

      // Convert base64 to blob
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      
      // Make sure audio is fully loaded before playing
      audio.oncanplaythrough = () => {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(playError => {
            console.error("Error playing audio:", playError);
            toast.error("Failed to play audio. Please try again.");
            setIsLoading(false);
            URL.revokeObjectURL(audioUrl);
          });
      };
      
      audio.onerror = (e) => {
        console.error("Audio error:", e);
        toast.error("Error loading audio. Please try again.");
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setAudioElement(null);
      };
      
      setAudioElement(audio);
    } catch (err) {
      console.error("Error processing audio:", err);
      toast.error("Failed to play audio. Please try again.");
      setIsLoading(false);
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
