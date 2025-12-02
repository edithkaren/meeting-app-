import React, { useState } from 'react';

interface LandingProps {
  onStart: (stream: MediaStream) => void;
}

interface ScheduledMeeting {
  id: string;
  topic: string;
  time: string;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'join' | 'schedule'>('home');
  
  // Join State
  const [joinId, setJoinId] = useState('');
  
  // Schedule State
  const [scheduleData, setScheduleData] = useState({ 
    topic: 'Gemini Discussion', 
    date: new Date().toISOString().split('T')[0], 
    time: '10:00' 
  });
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        onStart(stream);
    } catch (err) {
        console.error(err);
        setError("Could not access camera/microphone. Please check permissions and try again.");
        setIsLoading(false);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(`${scheduleData.date}T${scheduleData.time}`);
    const dateStr = isNaN(dateObj.getTime()) ? 'Today, 10:00 AM' : dateObj.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    
    const newMeeting = {
        id: Math.random().toString(36).substr(2, 9),
        topic: scheduleData.topic || 'No Topic',
        time: dateStr
    };

    setMeetings([...meetings, newMeeting]);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white overflow-hidden relative selection:bg-blue-500 selection:text-white font-sans">
      {/* Background decoration */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"></div>
       </div>

      {view === 'home' && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in duration-500">
            {/* Header / Logo */}
             <div className="mb-12 flex flex-col items-center">
                 <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                 </div>
                 <h1 className="text-4xl font-bold tracking-tight">Gemini Meeting</h1>
                 <p className="mt-2 text-gray-400">Video conferencing with AI intelligence</p>
             </div>

             {/* Error Message */}
             {error && (
                <div className="mb-6 w-full max-w-md bg-red-500/10 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                {/* New Meeting */}
                <button
                    onClick={handleStart}
                    disabled={isLoading}
                    className="col-span-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20 group"
                >
                    <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                        {isLoading ? (
                             <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        )}
                    </div>
                    <span className="font-semibold text-lg">{isLoading ? 'Starting...' : 'New Meeting'}</span>
                </button>

                {/* Join */}
                <button
                    onClick={() => setView('join')}
                    disabled={isLoading}
                    className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border border-gray-700"
                >
                    <div className="p-2 bg-gray-700 rounded-lg text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <span className="font-medium">Join</span>
                </button>

                {/* Schedule */}
                <button
                    onClick={() => setView('schedule')}
                    disabled={isLoading}
                    className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border border-gray-700"
                >
                    <div className="p-2 bg-gray-700 rounded-lg text-blue-400">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                    <span className="font-medium">Schedule</span>
                </button>
            </div>

            {/* Meeting List */}
            {meetings.length > 0 && (
                <div className="w-full max-w-md animate-in slide-in-from-bottom-5 duration-500">
                    <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider flex items-center justify-between">
                        <span>Upcoming</span>
                        <span className="text-xs font-normal text-gray-600">{meetings.length} scheduled</span>
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {meetings.map((m) => (
                            <div key={m.id} className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between transition-colors group">
                                <div>
                                    <div className="font-medium text-white">{m.topic}</div>
                                    <div className="text-sm text-gray-500 mt-1">{m.time}</div>
                                    <div className="text-xs text-gray-600 mt-0.5">ID: {m.id}</div>
                                </div>
                                <button 
                                    onClick={handleStart}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                >
                                    Start
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Join Modal */}
      {view === 'join' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e1e1e] w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Join Meeting</h2>
                    <button onClick={() => setView('home')} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Meeting ID or Link Name</label>
                        <input 
                            autoFocus
                            type="text" 
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-shadow"
                            placeholder="Enter ID"
                            value={joinId}
                            onChange={(e) => setJoinId(e.target.value)}
                        />
                    </div>
                    <div className="pt-2">
                         <button 
                            onClick={handleStart}
                            disabled={!joinId.trim() || isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                        >
                            {isLoading ? 'Joining...' : 'Join'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

       {/* Schedule Modal */}
      {view === 'schedule' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e1e1e] w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                 <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Schedule Meeting</h2>
                    <button onClick={() => setView('home')} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Topic</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-shadow"
                            placeholder="Enter meeting topic"
                            value={scheduleData.topic}
                            onChange={(e) => setScheduleData({...scheduleData, topic: e.target.value})}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
                             <input 
                                type="date" 
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none [color-scheme:dark] transition-shadow"
                                value={scheduleData.date}
                                onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                                required
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-gray-400 mb-1.5">Time</label>
                             <input 
                                type="time" 
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none [color-scheme:dark] transition-shadow"
                                value={scheduleData.time}
                                onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                                required
                             />
                        </div>
                    </div>
                    <div className="pt-2">
                         <button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
      
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-600 pointer-events-none">
         Powered by Gemini Live API
      </div>
    </div>
  );
};