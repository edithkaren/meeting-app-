import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, arrayBufferToBase64 } from '../utils/audioUtils';

interface ServiceConfig {
  apiKey: string;
  onAudioData: (audioBuffer: AudioBuffer) => void;
  onTranscription: (text: string, isUser: boolean, isFinal: boolean) => void;
  onStatusChange: (status: 'connected' | 'disconnected' | 'error') => void;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: LiveSession | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private config: ServiceConfig;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private sessionPromise: Promise<LiveSession> | null = null;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async connect(stream: MediaStream) {
    try {
      this.stream = stream;
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a helpful and professional colleague in a video meeting. You are concise, engaging, and simulated to be on a video call. Keep responses relatively short to allow for conversation.",
        },
        callbacks: {
          onopen: this.handleOpen.bind(this),
          onmessage: this.handleMessage.bind(this),
          onclose: this.handleClose.bind(this),
          onerror: this.handleError.bind(this),
        }
      });
      
    } catch (error) {
      console.error('Connection failed:', error);
      this.config.onStatusChange('error');
    }
  }

  private handleOpen() {
    this.config.onStatusChange('connected');
    this.setupAudioInput();
  }

  private setupAudioInput() {
    if (!this.inputAudioContext || !this.stream) return;

    this.source = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      if (this.sessionPromise) {
        this.sessionPromise.then(session => {
           session.sendRealtimeInput({ media: pcmBlob });
        });
      }
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Audio
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext) {
      const audioData = base64ToUint8Array(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, this.outputAudioContext, 24000, 1);
      this.config.onAudioData(audioBuffer);
    }

    // Handle Transcription (User)
    if (message.serverContent?.inputTranscription) {
        this.config.onTranscription(
            message.serverContent.inputTranscription.text, 
            true, 
            !!message.serverContent.turnComplete
        );
    }

    // Handle Transcription (Model)
    if (message.serverContent?.outputTranscription) {
        this.config.onTranscription(
            message.serverContent.outputTranscription.text, 
            false, 
            !!message.serverContent.turnComplete
        );
    }
  }

  private handleClose() {
    this.config.onStatusChange('disconnected');
    this.cleanup();
  }

  private handleError(e: ErrorEvent) {
    console.error("Gemini Live Error", e);
    this.config.onStatusChange('error');
    this.cleanup();
  }

  public sendVideoFrame(base64Image: string) {
     if (this.sessionPromise) {
        this.sessionPromise.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'image/jpeg',
                    data: base64Image
                }
            });
        });
     }
  }

  public async disconnect() {
    if (this.sessionPromise) {
       const session = await this.sessionPromise;
       (session as any).close?.();
    }
    this.cleanup();
  }

  private cleanup() {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    // Do not stop the stream tracks here as they are owned by the parent component
    
    this.processor = null;
    this.source = null;
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.stream = null;
  }
}