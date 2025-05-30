'use client';
import React, { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AudioProcessor from '../../../components/AudioProcessor';
import { parseGroceryList, useGrocery, GroceryProvider } from '../../../components/GeminiParser';

export default function AudioRecorder() {
  return (
    <GroceryProvider>
      <AudioRecorderContent />
    </GroceryProvider>
  );
}

function AudioRecorderContent() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { items, setItems, isProcessing, setIsProcessing, error, setError } = useGrocery();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number | undefined>(undefined);
  const transcriptRef = useRef("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (recording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [recording]);

  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const drawWaveform = () => {
    if (!canvasRef.current || !analyser.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.current.getByteTimeDomainData(dataArray);

    // White background
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the wave
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(59, 130, 246)'; // Blue wave
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationFrame.current = requestAnimationFrame(drawWaveform);
  };

  const startRecording = async () => {
    try {
    setTranscript("");
      setStatus("Starting recording...");
      setError("");
      setAudioBlob(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      analyser.current.fftSize = 2048;
      
      drawWaveform();

    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
    };

    mediaRecorder.current.start();
    setRecording(true);
      setStatus("Recording in progress...");
    } catch (err: unknown) {
      console.error("Error starting recording:", err);
      setError(`Failed to start recording: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const stopRecording = () => {
    try {
    mediaRecorder.current?.stop();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    setRecording(false);
      setStatus("Processing your recording...");
    } catch (err: unknown) {
      console.error("Error stopping recording:", err);
      setError(`Failed to stop recording: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleClearItems = () => {
    setItems([]);
    setTranscript("");
    setError("");
  };

  useEffect(() => {
    const processTranscript = async () => {
      if (transcriptRef.current) {
        setIsProcessing(true);
        setError(null);
        try {
          const parsedItems = await parseGroceryList(transcriptRef.current);
          setItems([...items, ...parsedItems]);
        } catch (err) {
          console.error('Error processing transcript:', err);
          setError(err instanceof Error ? err.message : 'Failed to parse grocery list');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    processTranscript();
  }, [transcriptRef.current, setItems, setIsProcessing, setError]);

  const handleTranscriptUpdate = (newTranscript: string) => {
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
  };

  const formatQuantity = (quantity: number | null): string => {
    if (quantity === null) return "N/A";
    return `${quantity.toFixed(2)} kg`;
  };

  const formatPrice = (price: number | null): string => {
    if (price === null) return "N/A";
    return `₹${price.toFixed(2)}`;
  };

  const handleGenerateBill = () => {
    if (items.length === 0) {
      setError("Please add items before generating a bill");
      return;
    }
    
    // Format items for billing page
    const billingItems = items.map(item => ({
      name: item.item,
      quantity: item.quantity_kg || 1,
      price: item.price || 0
    }));

    // Store items in localStorage
    localStorage.setItem('selectedItems', JSON.stringify(billingItems));
    
    // Navigate to billing page
    router.push('/billing');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Left Section - Recorder */}
        <div className="w-1/2 p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Voice Recorder</h2>
            <p className="text-center text-gray-600 mb-4">Press Space to Start/Stop Recording</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-md">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-[200px] bg-white rounded-lg mb-4 border border-gray-200"
              />
              
              <div className="flex flex-col items-center gap-4">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors shadow-sm"
                  >
                    Start Recording (Space)
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-colors shadow-sm"
                  >
                    Stop Recording (Space)
                  </button>
                )}
                {status && (
                  <p className="text-blue-600 mt-2">{status}</p>
                )}
                {error && (
                  <p className="text-red-600 mt-2">{error}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Transcript:</h3>
              <div className="bg-white p-4 rounded-lg min-h-[100px] border border-gray-200">
                <p className="text-gray-700 text-lg">{transcript || "No transcription yet."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Parsed Results */}
        <div className="w-1/2 bg-gray-50 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Parsed Grocery List</h2>
              {items.length > 0 && (
                <button
                  onClick={handleClearItems}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  <span>Clear All</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Processing...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.length > 0 ? (
                          items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.item}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatQuantity(item.quantity_kg)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(item.price)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                              No items added yet. Start recording to add items.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleGenerateBill}
                      className={`px-6 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
                        items.length > 0 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={items.length === 0}
                    >
                      <span>Generate Bill</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Processor Component */}
      {audioBlob && (
        <AudioProcessor
          audioBlob={audioBlob}
          onTranscriptionComplete={handleTranscriptUpdate}
          onError={setError}
          onStatusUpdate={setStatus}
        />
      )}
    </div>
  );
}
