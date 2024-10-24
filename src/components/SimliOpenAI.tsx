'use client';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { SimliClient } from "simli-client";
import cn from "@/utils/TailwindMergeAndClsx";

interface SimliOpenAIProps {
  simli_faceid: string;
  openai_voice: "echo" | "alloy" | "shimmer";
  initialPrompt: string;
  onStart?: () => void;
  onClose?: () => void;
}

const simliClient = new SimliClient();

const SimliOpenAI: React.FC<SimliOpenAIProps> = ({
  simli_faceid,
  openai_voice,
  initialPrompt,
  onStart,
  onClose,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const openAIClientRef = useRef<RealtimeClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunkQueueRef = useRef<Int16Array[]>([]);
  const isProcessingChunkRef = useRef(false);

  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig as any);
      console.log("Simli Client initialized");
    }
  }, [simli_faceid]);

  const initializeOpenAIClient = useCallback(async () => {
    try {
      openAIClientRef.current = new RealtimeClient({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowAPIKeyInBrowser: true,
      });

      await openAIClientRef.current.updateSession({
        instructions: initialPrompt,
        voice: openai_voice,
        turn_detection: { type: "server_vad" },
        input_audio_transcription: { model: "whisper-1" },
      });

      openAIClientRef.current.on("conversation.updated", handleConversationUpdate);
      openAIClientRef.current.on("conversation.interrupted", interruptConversation);
      openAIClientRef.current.on("input_audio_buffer.speech_stopped", handleSpeechStopped);

      await openAIClientRef.current.connect();
      startRecording();
      setIsConnected(true);
      onStart?.();
    } catch (error: any) {
      console.error("Error initializing OpenAI client:", error);
      setError(`Failed to initialize OpenAI client: ${error.message}`);
    }
  }, [initialPrompt, openai_voice, onStart]);

  const handleConversationUpdate = useCallback((event: any) => {
    const { item, delta } = event;
    if (item.type === "message" && item.role === "assistant" && delta?.audio) {
      const downsampledAudio = downsampleAudio(delta.audio, 24000, 16000);
      audioChunkQueueRef.current.push(downsampledAudio);
      if (!isProcessingChunkRef.current) {
        processNextAudioChunk();
      }
    }
  }, []);

  const processNextAudioChunk = useCallback(() => {
    if (audioChunkQueueRef.current.length > 0 && !isProcessingChunkRef.current) {
      isProcessingChunkRef.current = true;
      const audioChunk = audioChunkQueueRef.current.shift();
      if (audioChunk) {
        simliClient?.sendAudioData(audioChunk as any);
        isProcessingChunkRef.current = false;
        processNextAudioChunk();
      }
    }
  }, []);

  const startSimliClient = async () => {
    try {
      await simliClient.start();
      await initializeOpenAIClient();
    } catch (error) {
      console.error("Error starting clients:", error);
      setError("Failed to start interaction");
    }
  };

  const closeSimliClient = () => {
    stopRecording();
    simliClient.close();
    openAIClientRef.current?.disconnect();
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsConnected(false);
    onClose?.();
  };

  const startRecording = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          audioData[i] = Math.floor(Math.max(-1, Math.min(1, inputData[i])) * 32767);
        }
        openAIClientRef.current?.appendInputAudio(audioData);
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Error accessing microphone");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const interruptConversation = () => {
    simliClient?.ClearBuffer();
    openAIClientRef.current?.cancelResponse("");
  };

  const handleSpeechStopped = useCallback((event: any) => {
    console.log("Speech stopped", event);
  }, []);

  const downsampleAudio = (audioData: Int16Array, inputSampleRate: number, outputSampleRate: number): Int16Array => {
    if (inputSampleRate === outputSampleRate) return audioData;
    const ratio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Int16Array(newLength);
    for (let i = 0; i < newLength; i++) {
      result[i] = audioData[Math.round(i * ratio)];
    }
    return result;
  };

  useEffect(() => {
    initializeSimliClient();

    if (simliClient) {
      simliClient.on("connected", () => {
        console.log("SimliClient connected");
        const audioData = new Uint8Array(6000).fill(0);
        simliClient?.sendAudioData(audioData);
      });
    }

    return () => {
      closeSimliClient();
    };
  }, [initializeSimliClient]);

  return (
    <div className="relative bg-gray-300 w-full h-full rounded-lg overflow-hidden">
      <video ref={videoRef} autoPlay playsInline></video>
      <audio ref={audioRef} autoPlay></audio>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        {!isConnected ? (
          <button
            onClick={startSimliClient}
            className="rounded bg-white py-2 px-4 hover:bg-opacity-70"
          >
            <b>Start</b>
          </button>
        ) : (
          <button
            onClick={closeSimliClient}
            className="rounded bg-red-600 text-white py-2 px-4 hover:bg-opacity-70"
          >
            <b>Close</b>
          </button>
        )}
      </div>
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default SimliOpenAI;