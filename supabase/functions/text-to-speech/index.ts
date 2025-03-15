
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = "alloy" } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    // Get API key from environment variables
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key is not configured',
          message: 'Please add the OPENAI_API_KEY to your Supabase project secrets',
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Generating speech for text: "${text.substring(0, 50)}..." with voice: ${voice}`);

    // Send text to OpenAI's TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = errorData;
      
      try {
        // Try to parse as JSON to get a cleaner error message
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorJson.error || errorData;
      } catch (e) {
        // If parsing fails, use the raw error text
      }
      
      console.error("OpenAI API error:", errorMessage);
      
      // Check if it's an authentication or quota error
      if (response.status === 401 || 
          response.status === 429 || 
          errorMessage.includes("auth") || 
          errorMessage.includes("key") ||
          errorMessage.includes("quota") ||
          errorMessage.includes("exceeded")) {
        return new Response(
          JSON.stringify({ 
            error: `OpenAI API error: ${errorMessage}`,
            message: 'Please check your OpenAI API key and quota'
          }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorMessage}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the audio data as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return new Response(
        JSON.stringify({ error: "Received empty audio buffer from OpenAI" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`);
    
    // Convert to base64
    const uint8Array = new Uint8Array(audioBuffer);
    const base64Audio = btoa(String.fromCharCode(...uint8Array));
    
    console.log(`Converted to base64 string of length: ${base64Audio.length}`);

    return new Response(
      JSON.stringify({ audio: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
