import React from 'react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { Button } from '@/components/ui/button';

export default function SpeechTest() {
  const {
    isRecording,
    transcript,
    browserSupportsSpeechRecognition,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecording();

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Speech Recognition Test</h2>
      <Button
        variant={isRecording ? 'destructive' : 'secondary'}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!browserSupportsSpeechRecognition}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      <Button variant="ghost" onClick={resetRecording} className="ml-2">
        Reset
      </Button>
      <div className="mt-4">
        <h3>Transcript:</h3>
        <p>{transcript || 'No speech detected yet.'}</p>
      </div>
    </div>
  );
} 