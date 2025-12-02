import React from 'react';

interface ControlBarProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isAudioOn,
  isVideoOn,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onToggleChat,
  isChatOpen
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#1a1a1a] border-t border-gray-800 flex items-center justify-between px-6 z-50">
      <div className="flex items-center space-x-4">
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`flex flex-col items-center justify-center w-16 h-full space-y-1 hover:bg-gray-800 rounded-lg transition-colors ${!isAudioOn ? 'text-red-500' : 'text-gray-300'}`}
        >
            {isAudioOn ? (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
               </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
            )}
          <span className="text-xs">{isAudioOn ? 'Mute' : 'Unmute'}</span>
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`flex flex-col items-center justify-center w-16 h-full space-y-1 hover:bg-gray-800 rounded-lg transition-colors ${!isVideoOn ? 'text-red-500' : 'text-gray-300'}`}
        >
             {isVideoOn ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
             )}
          <span className="text-xs">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
         {/* Share Screen */}
         <button
          onClick={onToggleScreenShare}
          className={`flex flex-col items-center justify-center w-16 h-full space-y-1 hover:bg-gray-800 rounded-lg transition-colors ${isScreenSharing ? 'text-green-500' : 'text-gray-300'}`}
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
            </svg>
          <span className="text-xs">Share</span>
        </button>

        {/* Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`flex flex-col items-center justify-center w-16 h-full space-y-1 hover:bg-gray-800 rounded-lg transition-colors ${isChatOpen ? 'text-blue-500' : 'text-gray-300'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <span className="text-xs">Chat</span>
        </button>
      </div>

      <div>
        <button
          onClick={onEndCall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          End
        </button>
      </div>
    </div>
  );
};
