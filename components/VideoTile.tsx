import React, { useRef, useEffect } from 'react';
import { Participant } from '../types';

interface VideoTileProps {
  participant: Participant;
  videoStream?: MediaStream | null;
  isLocal?: boolean;
  audioLevel?: number; // 0 to 1
}

export const VideoTile: React.FC<VideoTileProps> = ({ 
  participant, 
  videoStream, 
  isLocal, 
  audioLevel = 0 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  // Visualizer for AI or audio-only participants
  const showVisualizer = !participant.isVideoOn || (!videoStream && !isLocal);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden border-2 ${participant.isSpeaking ? 'border-green-500' : 'border-transparent'} w-full h-full min-h-[300px] flex items-center justify-center`}>
      {/* Video Layer */}
      {!showVisualizer && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent echo loop
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      )}

      {/* Fallback / Visualizer Layer */}
      {showVisualizer && (
        <div className="flex flex-col items-center justify-center w-full h-full">
            {participant.isAi ? (
                 <div className="relative flex items-center justify-center">
                    <div className="absolute w-32 h-32 bg-blue-500 rounded-full opacity-20 animate-pulse" style={{ transform: `scale(${1 + audioLevel})`}}></div>
                    <div className="absolute w-24 h-24 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.1s', transform: `scale(${1 + audioLevel * 0.8})`}}></div>
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                    </div>
                 </div>
            ) : (
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-semibold text-gray-300">
                    {participant.name.charAt(0)}
                </div>
            )}
            <p className="mt-4 text-gray-400 font-medium">{participant.isAi ? "Gemini AI (Thinking...)" : "Video Off"}</p>
        </div>
      )}

      {/* Name Tag */}
      <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-sm font-medium backdrop-blur-sm">
        {participant.name} {isLocal && "(Me)"} {participant.isSpeaking && !isLocal && "🔊"}
      </div>

      {/* Mute Indicator */}
      {!participant.isAudioOn && (
         <div className="absolute top-4 right-4 bg-red-600/80 p-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                <path d="M5.591 8.543L1.5 12.634a11.235 11.235 0 012.631-4.31l1.46 1.46v-.001zM7.818 10.77a5.25 5.25 0 006.71 6.71l-6.71-6.71z" />
            </svg>
         </div>
      )}
    </div>
  );
};
