
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceRecorderProps {
  questionId: string;
  questionText: string;
  questionType: string;
  onTranscriptReady: (transcript: string, feedback: string) => void;
}

const VoiceRecorder = ({ 
  questionId, 
  questionText, 
  questionType, 
  onTranscriptReady 
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Clean up audio URL when component unmounts
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        processAudio(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert the audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (!base64Audio) {
            throw new Error("Failed to convert audio to base64");
          }
          
          // Call speech-to-text Edge Function
          const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
            'speech-to-text',
            {
              body: { audio: base64Audio }
            }
          );
          
          if (transcriptionError) {
            throw transcriptionError;
          }
          
          const transcript = transcriptionData.text;
          
          // Save audio URL and transcript to Supabase
          // In a real implementation, we would upload the audio file to storage
          // For now, we'll just save the transcript
          
          // Get feedback on the answer
          const { data: feedbackData, error: feedbackError } = await supabase.functions.invoke(
            'generate-feedback',
            {
              body: { 
                questionText, 
                questionType, 
                answer: transcript 
              }
            }
          );
          
          if (feedbackError) {
            throw feedbackError;
          }
          
          // Pass transcript and feedback to parent component
          onTranscriptReady(transcript, feedbackData.feedback);
        } catch (error) {
          console.error("Error processing audio:", error);
          toast.error("Error processing audio. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Error processing audio. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      {!isRecording && !audioURL && !isProcessing && (
        <Button 
          onClick={startRecording} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Mic className="h-5 w-5" />
          Record Answer
        </Button>
      )}
      
      {isRecording && (
        <Button 
          onClick={stopRecording} 
          variant="destructive" 
          className="flex items-center gap-2 animate-pulse"
        >
          <Square className="h-5 w-5" />
          Stop Recording
        </Button>
      )}
      
      {isProcessing && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing your answer...
        </div>
      )}
      
      {audioURL && !isProcessing && (
        <div className="w-full mt-2">
          <p className="text-sm text-gray-500 mb-2">Your recorded answer:</p>
          <audio src={audioURL} controls className="w-full" />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
