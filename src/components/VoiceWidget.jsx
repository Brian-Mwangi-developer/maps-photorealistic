import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import { usePorcupine } from "@picovoice/porcupine-react";
import hiTouristaKeywordModel from "../hi_tourista";
import modelParams from "../porcupine_params";
import AIAgent from "@/components/AddLocationAI";

const VoiceServer = import.meta.env.VITE_VOICE_SERVER_URL;
const SOCKET_SERVER_URL = VoiceServer;

const VoiceWidget = ({ listening, onResultsUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const socket = useRef(null);

  const { keywordDetection, isLoaded, init, start, stop } = usePorcupine();

  useEffect(() => {
    const socketConnection = io(SOCKET_SERVER_URL);
    socket.current = socketConnection;

    socketConnection.on("transcription", (data) => {
      setTranscription(data);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const initEngine = async () => {
    await init(
      "QTd8LeO7BXs3+akU4/3GNpxBi02FS+kAt9268MRyBhdzofy2W2fpZw==",
      {
        base64: hiTouristaKeywordModel,
        label: "Hi Tourista",
      },
      { base64: modelParams }
    );
    start();
    setIsListening(true);
    listening(true);
  };

  useEffect(() => {
    if (keywordDetection !== null) {
      startRecording();
      alert("Start speaking now!");
    }
  }, [keywordDetection]);

  const startRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (socket.current) {
            socket.current.emit("audio-chunk", event.data);
          }
        };
        mediaRecorder.onstop = () => {
          setIsRecording(false);
        };
        mediaRecorder.start(1000);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    socket.current.emit("stop-recording");
  };

  useEffect(() => {
    if (isRecording) {
      silenceTimeoutRef.current = setTimeout(() => {
        stopRecording();
        setIsListening(false);
        listening(false);
      }, 5000); // Stop after 5 seconds of silence
    } else {
      clearTimeout(silenceTimeoutRef.current);
    }
  }, [isRecording]);

  return (
    <div className="absolute z-20">
      <button
        onClick={initEngine}
        disabled={isListening}
        className={`${
          isListening ? "bg-blue-500" : "bg-green-500"
        } flex items-center justify-center rounded-full h-12 w-12 cursor-pointer animate-bounce`}
      >
        <img
          src="/tourista.svg"
          alt="Tourista AI"
          className="h-10 w-10 object-cover ml-2"
        />
      </button>
      <AIAgent
        transcription={transcription}
        onResultsUpdate={onResultsUpdate}
      />
    </div>
  );
};

export default VoiceWidget;
