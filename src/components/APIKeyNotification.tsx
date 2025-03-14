
import React from "react";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const APIKeyNotification = () => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>OpenAI API Key Issue</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          There seems to be an issue with the OpenAI API key. The text-to-speech feature requires a valid API key.
        </p>
        <p className="text-sm">
          Please verify that you've added a valid OpenAI API key in your Supabase Project Dashboard &gt; Settings &gt; API &gt; Project Secrets with the name <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">OPENAI_API_KEY</code>
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default APIKeyNotification;
