
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
      <AlertTitle>Missing OpenAI API Key</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          The OpenAI API key is missing from your Supabase project secrets.
        </p>
        <p className="text-sm">
          To fix this issue: Go to your Supabase Project Dashboard &gt; Settings &gt; API &gt; Project Secrets and add your 
          <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">OPENAI_API_KEY</code>
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default APIKeyNotification;
