import React, { useState } from 'react';
import { Landing } from './components/Landing';
import { MeetingRoom } from './components/MeetingRoom';

function App() {
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  // In a real app, this should come from a secure backend or environment variable injection during build
  // For this demo, we assume the environment variable is available as per instructions.
  const apiKey = process.env.API_KEY || '';

  const handleStartMeeting = (stream: MediaStream) => {
      setMediaStream(stream);
      setIsInMeeting(true);
  };

  const handleEndMeeting = () => {
      setIsInMeeting(false);
      setMediaStream(null);
  };

  if (!apiKey) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 text-center">
              <div>
                  <h1 className="text-xl font-bold text-red-500 mb-2">API Key Missing</h1>
                  <p>Please ensure process.env.API_KEY is configured.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="antialiased text-gray-100">
      {!isInMeeting || !mediaStream ? (
        <Landing onStart={handleStartMeeting} />
      ) : (
        <MeetingRoom 
            apiKey={apiKey} 
            initialStream={mediaStream}
            onEndMeeting={handleEndMeeting} 
        />
      )}
    </div>
  );
}

export default App;