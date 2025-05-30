'use client';
import { useState, useEffect } from 'react';
import { AssemblyAI } from "assemblyai";

const API_KEY = process.env.NEXT_PUBLIC_ASSEMBLYAI;
if (!API_KEY) {
  throw new Error("Missing AssemblyAI API key in environment variable NEXT_PUBLIC_ASSEMBLYAI");
}
const client = new AssemblyAI({ apiKey: API_KEY });

interface AudioProcessorProps {
  audioBlob: Blob;
  onTranscriptionComplete: (text: string) => void;
  onError: (error: string) => void;
  onStatusUpdate: (status: string) => void;
}

export default function AudioProcessor({ 
  audioBlob, 
  onTranscriptionComplete, 
  onError, 
  onStatusUpdate 
}: AudioProcessorProps) {
  const processAudio = async () => {
    try {
      onStatusUpdate("Uploading to AssemblyAI...");
      const uploadUrl = await client.files.upload(audioBlob);
      console.log("Uploaded audio URL:", uploadUrl);

      onStatusUpdate("Transcribing in ...");
      const transcriptResponse = await client.transcripts.transcribe({
        audio: uploadUrl,
        speech_model: "nano",
        language_code: "ta",
      });

      console.log("Transcription response:", transcriptResponse);
      if (transcriptResponse.text) {
        onTranscriptionComplete(transcriptResponse.text);
        onStatusUpdate("Transcription complete!");
      } else {
        onError("No text was transcribed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Error in transcription process:", err);
      onError(`Transcription failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Start processing immediately when component mounts
  useEffect(() => {
    processAudio();
  }, []); // Empty dependency array means this runs once on mount

  return null; // This is a utility component, no UI needed
} 