"use client"

import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    commands: [],
  });

  useEffect(() => {
    setIsBrowserSupported(browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    console.log('Transcript updated:', transcript);
  }, [transcript]);

  const startRecording = () => {
    if (isBrowserSupported) {
      setIsRecording(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      console.log('Started recording...');
    } else {
      console.error('Browser does not support speech recognition.');
    }
  };

  const stopRecording = () => {
    if (isBrowserSupported) {
      SpeechRecognition.stopListening();
      setIsRecording(false);
      console.log('Stopped recording.');
    }
  };

  const resetRecording = () => {
    resetTranscript();
    console.log('Transcript reset.');
  };

  return {
    isRecording,
    transcript,
    browserSupportsSpeechRecognition: isBrowserSupported,
    startRecording,
    stopRecording,
    resetRecording,
  };
}; 