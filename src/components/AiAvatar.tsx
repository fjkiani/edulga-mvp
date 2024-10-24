"use client";
import exp from "constants";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import { SimliClient } from "simli-client";

const simliClient = new SimliClient();

const AiAvatar = () => {
  const [isConnected, setIsConnected] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // 1: Initialize SimliClient
  const InitializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: "148efaa3-0224-490d-ab77-2a026f4e6738",
        maxSessionLength: 20, // in seconds
        handleSilence: true,
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig as any);
      console.log("Simli Client initialized");
    }
  }, []);

  // 2: Start WebRTC connection
  const startSimliClient = () => {
    simliClient.start();
  };

  const closeSimliClient = () => {
    simliClient.close();
  }

  // 3: Call InitializeSimliClient and startSimliClient
  useEffect(() => {
    InitializeSimliClient();

    if (simliClient) {
      simliClient.on("connected", () => {
        console.log("SimliClient is now connected!");
        sendEmptyAudioData();
        setIsConnected(true);
      });

      simliClient.on("disconnected", () => {
        console.log("SimliClient has disconnected!");
      });

      simliClient.on("failed", () => {
        console.log("SimliClient has failed to connect!");
        simliClient.close();
      });
    }

    return () => {
      simliClient.close();
    };
  }, [InitializeSimliClient]);

  // 4: Send audio data
  const sendEmptyAudioData = () => {
    const emptyAudioData = new Uint8Array(6000).fill(0);
    simliClient.sendAudioData(emptyAudioData);
  };

  return (
    <div className="relative bg-gray-300 w-full h-full rounded-lg overflow-hidden">
      <video ref={videoRef} autoPlay playsInline></video>
      <audio ref={audioRef} autoPlay></audio>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        {!isConnected ? (
          <button
            onClick={startSimliClient}
            className=" rounded bg-white py-2 px-4 hover:bg-opacity-70"
          >
            <b>Start</b>
          </button>
        ) : (
          <button
            onClick={closeSimliClient}
            className=" rounded bg-red-600 text-white py-2 px-4 hover:bg-opacity-70"
          >
            <b>Close</b>
          </button>
        )}
      </div>
    </div>
  );
};

export default AiAvatar;
