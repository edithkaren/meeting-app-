import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GeminiLiveService } from '../services/geminiLiveService';
import { VideoTile } from './VideoTile';
import { ControlBar } from './ControlBar';
import { Participant, ConnectionStatus, ChatMessage } from '../types';

interface MeetingRoomProps {
  apiKey: string;
  initialStream: MediaStream;
  onEndMeeting: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ apiKey, initialStream, onEndMeeting }) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'me', name: 'User', isAudioOn: true, isVideoOn: true, isScreenSharing: false, isSpeaking: false },
    { id: 'gemini', name: 'Gemini', isAudioOn: true, isVideoOn: true, isScreenSharing: false, isSpeaking: false, isAi: true }
  ]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(initialStream);
  const [aiAudioLevel, setAiAudioLevel] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const liveServiceRef = useRef<GeminiLiveService | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const videoCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  // Chat Auto-scroll
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAudioData = useCallback((audioBuffer: AudioBuffer) => {
    // Play Audio
    if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    const ctx = outputAudioContextRef.current;
    
    // Update visualizer level based on RMS of buffer
    const channelData = audioBuffer.getChannelData(0);
    let sum = 0;
    for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sum / channelData.length);
    setAiAudioLevel(Math.min(1, rms * 5)); // Amplify for visual effect
    
    // Reset visualizer after short delay
    setTimeout(() => setAiAudioLevel(0), audioBuffer.duration * 1000);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    // Schedule playback
    const currentTime = ctx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
    }
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    // Update speaking state
    updateParticipant('gemini', { isSpeaking: true });
    source.onended = () => updateParticipant('gemini', { isSpeaking: false });
  }, []);

  const handleTranscription = useCallback((text: string, isUser: boolean, isFinal: boolean) => {
      // Very simple chat logic: Only add final messages to avoid flickering
      if (isFinal) {
          setChatMessages(prev => [
              ...prev,
              {
                  id: Date.now().toString() + Math.random().toString(),
                  sender: isUser ? 'user' : 'ai',
                  text: text,
                  timestamp: new Date()
              }
          ]);
      }
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        // We use the stream passed from props
        const service = new GeminiLiveService({
          apiKey,
          onAudioData: handleAudioData,
          onTranscription: handleTranscription,
          onStatusChange: (s) => {
            if (s === 'connected') setStatus(ConnectionStatus.CONNECTED);
            if (s === 'error') setStatus(ConnectionStatus.ERROR);
            if (s === 'disconnected') setStatus(ConnectionStatus.DISCONNECTED);
          }
        });

        liveServiceRef.current = service;
        await service.connect(initialStream);

      } catch (e) {
        console.error("Failed to init meeting", e);
        setStatus(ConnectionStatus.ERROR);
      }
    };

    init();

    return () => {
      liveServiceRef.current?.disconnect();
      outputAudioContextRef.current?.close();
      // We don't stop the stream tracks here anymore as they are managed by App.tsx (or simply let to die with component)
      // But typically MeetingRoom should stop them if it's the only consumer. 
      // However, App.tsx passes it in. Let's let App.tsx or the logic in App handle it.
      // For this app flow, when MeetingRoom unmounts, we go back to landing, so tracks should stop.
      initialStream.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, initialStream]);

  // Video Streaming Loop
  useEffect(() => {
    if (status !== ConnectionStatus.CONNECTED || !localStream) return;

    // REVISED: The VideoTile renders the video. We can querySelector it.
    const captureLoop = setInterval(async () => {
        const videoEl = document.querySelector('video') as HTMLVideoElement; // First video is usually local if arranged first
        if (videoEl && !videoEl.paused && !videoEl.ended) {
             const canvas = videoCanvasRef.current;
             const ctx = canvas.getContext('2d');
             if (ctx) {
                 canvas.width = videoEl.videoWidth * 0.5; // Scale down for performance
                 canvas.height = videoEl.videoHeight * 0.5;
                 ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                 
                 const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
                 liveServiceRef.current?.sendVideoFrame(base64);
             }
        }
    }, 1000 / 5); // 5 FPS is enough for "looking at you" context

    return () => clearInterval(captureLoop);
  }, [status, localStream]);


  const toggleAudio = () => {
     if (localStream) {
         const audioTrack = localStream.getAudioTracks()[0];
         if (audioTrack) {
             audioTrack.enabled = !audioTrack.enabled;
             updateParticipant('me', { isAudioOn: audioTrack.enabled });
         }
     }
  };

  const toggleVideo = () => {
     if (localStream) {
         const videoTrack = localStream.getVideoTracks()[0];
         if (videoTrack) {
             videoTrack.enabled = !videoTrack.enabled;
             updateParticipant('me', { isVideoOn: videoTrack.enabled });
         }
     }
  };

  const toggleScreenShare = async () => {
    const me = participants.find(p => p.id === 'me');
    if (me?.isScreenSharing) {
        // Stop sharing - Revert to camera
        // Since we are not re-requesting permission, we might have lost the original camera track if we replaced it?
        // Actually, normally you keep the camera stream in a ref or request it again.
        // Since we want to avoid prompts, requesting again is risky if permission not persisted.
        // However, we can try.
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream); 
            // Also need to reconnect the live service audio source? 
            // The live service uses the stream object. If we create a NEW stream, we must update service.
            // Simplified: Just reconnect service with new stream.
            liveServiceRef.current?.disconnect();
            liveServiceRef.current?.connect(stream);
            
            updateParticipant('me', { isScreenSharing: false, isVideoOn: true });
        } catch(e) {
            console.error("Failed to restore camera", e);
        }
    } else {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            // Keep audio from original stream? Usually screen share replaces video but keeps mic.
            // We need to merge them.
            const micTrack = localStream?.getAudioTracks()[0];
            if (micTrack) {
                screenStream.addTrack(micTrack);
            }
            
            setLocalStream(screenStream);
            updateParticipant('me', { isScreenSharing: true, isVideoOn: true });
            
            // Reconnect service with new stream (screen + mic)
            liveServiceRef.current?.disconnect();
            liveServiceRef.current?.connect(screenStream);

            screenStream.getVideoTracks()[0].onended = () => {
                 toggleScreenShare(); // Revert when user clicks "Stop sharing" browser UI
            };
        } catch (e) {
            console.error("Screen share cancelled");
        }
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isChatOpen ? 'mr-80' : ''}`}>
        
        {/* Header / Info */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-gray-900/80 px-4 py-2 rounded-lg backdrop-blur-md">
            <span className={`w-3 h-3 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500' : 'bg-red-500'} `}>
            </span>
            <h1 className="font-semibold text-sm text-white">Gemini Daily Standup</h1>
            <span className="text-gray-400 text-xs border-l border-gray-600 pl-2">
                {status === ConnectionStatus.CONNECTING ? 'Connecting...' : status === ConnectionStatus.CONNECTED ? 'Live' : 'Offline'}
            </span>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 grid gap-4 grid-cols-1 md:grid-cols-2 items-center justify-center max-w-7xl mx-auto w-full">
           {participants.map(p => (
               <div key={p.id} className="w-full h-full max-h-[600px] flex">
                   <VideoTile 
                     participant={p} 
                     videoStream={p.id === 'me' ? localStream : null}
                     isLocal={p.id === 'me'}
                     audioLevel={p.id === 'gemini' ? aiAudioLevel : 0}
                   />
               </div>
           ))}
        </div>
        
        {/* Footer Spacer for Control Bar */}
        <div className="h-20"></div>
      </div>

      {/* Chat Sidebar */}
      <div className={`fixed right-0 top-0 bottom-20 w-80 bg-[#1a1a1a] border-l border-gray-800 transform transition-transform duration-300 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-4 border-b border-gray-800 font-semibold">Meeting Chat</div>
         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
                <div className="text-gray-500 text-center text-sm mt-10">No messages yet. Speak to see transcription here.</div>
            )}
            {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-xs mb-1 ${msg.sender === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {msg.sender === 'user' ? 'Me' : 'Gemini'}
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${msg.sender === 'user' ? 'bg-blue-600/20 text-blue-100' : 'bg-purple-600/20 text-purple-100'}`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            <div ref={chatEndRef}></div>
         </div>
      </div>

      <ControlBar 
        isAudioOn={participants.find(p=>p.id==='me')?.isAudioOn || false}
        isVideoOn={participants.find(p=>p.id==='me')?.isVideoOn || false}
        isScreenSharing={participants.find(p=>p.id==='me')?.isScreenSharing || false}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onEndCall={onEndMeeting}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />
    </div>
  );
};