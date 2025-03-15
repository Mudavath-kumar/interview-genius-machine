
import React from "react";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface APIKeyNotificationProps {
  error?: string;
}

const APIKeyNotification = ({ error }: APIKeyNotificationProps) => {
  const isQuotaError = error?.toLowerCase().includes('quota') || error?.toLowerCase().includes('exceeded');
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{isQuotaError ? "OpenAI API Quota Exceeded" : "OpenAI API Key Issue"}</AlertTitle>
      <AlertDescription>
        {isQuotaError ? (
          <>
            <p className="mb-2">
              Your OpenAI API key has exceeded its usage quota. The text-to-speech feature requires available quota.
            </p>
            <p className="text-sm">
              Please visit your <a href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener noreferrer" className="underline">OpenAI billing page</a> to add funds to your account, or update your Supabase Project Dashboard &gt; Settings &gt; API &gt; Project Secrets with a different <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">OPENAI_API_KEY</code>
            </p>
          </>
        ) : (
          <>
            <p className="mb-2">
              There seems to be an issue with the OpenAI API key. The text-to-speech feature requires a valid API key.
            </p>
            <p className="text-sm">
              Please verify that you've added a valid OpenAI API key in your Supabase Project Dashboard &gt; Settings &gt; API &gt; Project Secrets with the name <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">OPENAI_API_KEY</code>
            </p>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default APIKeyNotification;
