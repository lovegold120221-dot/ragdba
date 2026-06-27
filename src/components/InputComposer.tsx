import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Mic, X, Paperclip, FileText, Volume2 } from 'lucide-react';
import { Language } from '../types';

interface InputComposerProps {
  onSendMessage: (text: string, imageUrl?: string, attachment?: { name: string, content: string }) => void;
  loading: boolean;
  onOpenPhotoModal: () => void;
  onUploadRagDoc?: (file: File) => Promise<void>;
  language: Language;
}

export function InputComposer({
  onSendMessage,
  loading,
  onOpenPhotoModal,
  onUploadRagDoc,
  language
}: InputComposerProps) {
  const [text, setText] = useState('');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<{ name: string; content: string; file?: File } | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<{ name: string; dataUrl: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const imgInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() && !selectedImg && !selectedDoc && !selectedAudio) return;
    if (loading) return;

    let combinedText = text;
    if (selectedDoc) {
      combinedText += `\n\n[Attached Belgian Document "${selectedDoc.name}":\n${selectedDoc.content}]`;
    }
    if (selectedAudio) {
      combinedText += `\n\n[Attached Voice Dictation Prompt "${selectedAudio.name}"]`;
    }

    onSendMessage(combinedText, selectedImg || undefined, selectedDoc ? { name: selectedDoc.name, content: selectedDoc.content } : undefined);
    setText('');
    setSelectedImg(null);
    setSelectedDoc(null);
    setSelectedAudio(null);
  }

  function handleImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedImg(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Trigger persistent RAG upload if available
    if (onUploadRagDoc) {
      onUploadRagDoc(file).catch(err => console.error("RAG upload error:", err));
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setSelectedDoc({ name: file.name, content: content.slice(0, 8000), file });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedAudio({ name: file.name, dataUrl: evt.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleToggleAudioRecord() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use a browser that supports Web Speech API (e.g. Chrome, Edge, or Safari).");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      let speechLang = 'en-US';
      if (language === 'NL') speechLang = 'nl-NL';
      else if (language === 'FR') speechLang = 'fr-FR';
      else if (language === 'DE') speechLang = 'de-DE';
      rec.lang = speechLang;

      // Clear any prior recording transcript
      latestTranscriptRef.current = '';
      setVoiceTranscript('');

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentSessionTranscript = finalTranscript + interimTranscript;
        setVoiceTranscript(currentSessionTranscript);
        latestTranscriptRef.current = currentSessionTranscript;
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;

        const finalRecordedText = latestTranscriptRef.current;
        if (finalRecordedText && finalRecordedText.trim()) {
          setText(prev => {
            const trimmedPrev = prev.trim();
            const trimmedFinal = finalRecordedText.trim();
            if (trimmedPrev) {
              return trimmedPrev + ' ' + trimmedFinal;
            }
            return trimmedFinal;
          });
        }
        
        // Reset voice transcribing temporary preview state
        setVoiceTranscript('');
        latestTranscriptRef.current = '';
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  }

  const hasAttachments = selectedImg || selectedDoc || selectedAudio;

  return (
    <footer className="px-4 sm:px-8 py-4 flex flex-col items-center justify-center bg-[#FBFBFB] dark:bg-neutral-950 shrink-0 border-t border-neutral-300 dark:border-neutral-800 shadow-xs">
      <div className="max-w-3xl w-full relative">
        {/* Attached preview bar */}
        {hasAttachments && (
          <div className="flex flex-wrap items-center gap-2 mb-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 p-2.5 rounded-xl shadow-2xs animate-fade-in">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mr-1">Attached:</span>
            
            {selectedDoc && (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 px-2.5 py-1 rounded-lg text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0" />
                <span className="truncate max-w-[160px]" title={selectedDoc.name}>{selectedDoc.name}</span>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-300 px-1 py-0.5 rounded font-mono">RAG embedded</span>
                <button type="button" onClick={() => setSelectedDoc(null)} className="p-0.5 hover:text-red-600 dark:hover:text-red-450 cursor-pointer ml-1"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}

            {selectedImg && (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 px-2.5 py-1 rounded-lg text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 shadow-2xs">
                <img src={selectedImg} alt="Preview" className="w-4 h-4 object-cover rounded shrink-0" />
                <span className="truncate max-w-[160px]">Image attached</span>
                <button type="button" onClick={() => setSelectedImg(null)} className="p-0.5 hover:text-red-600 dark:hover:text-red-450 cursor-pointer ml-1"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}

            {selectedAudio && (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 px-2.5 py-1 rounded-lg text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 shadow-2xs">
                <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                <span className="truncate max-w-[160px]" title={selectedAudio.name}>{selectedAudio.name}</span>
                <button type="button" onClick={() => setSelectedAudio(null)} className="p-0.5 hover:text-red-600 dark:hover:text-red-450 cursor-pointer ml-1"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        )}

        {/* Voice Transcription Live Preview */}
        {isRecording && (
          <div className="mb-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 p-3 rounded-xl shadow-2xs animate-pulse flex items-start gap-2.5">
            <span className="relative flex h-2 w-2 mt-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1 font-mono">
                Live Voice Transcribing ({language})...
              </p>
              <p className="text-xs text-neutral-800 dark:text-neutral-200 italic leading-relaxed break-words">
                {voiceTranscript || "Start speaking now. Your voice is transcribing live..."}
              </p>
              <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1">
                Click the microphone button again to finish recording and append into the input field for editing.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center w-full min-h-[56px] px-2 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 focus-within:border-neutral-900 dark:focus-within:border-neutral-100 rounded-2xl shadow-xs transition-all">
          {/* Most Left: Separated Attachment Icons (Files vs Images vs Audio) */}
          <div className="flex items-center gap-1 mr-2 border-r border-neutral-200 dark:border-neutral-800 pr-2 shrink-0">
            {/* Attach Files (Document) */}
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              title="Attach Document (.pdf, .docx, .txt, .csv) for RAG analysis"
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer flex items-center justify-center"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Attach Images */}
            <button
              type="button"
              onClick={() => imgInputRef.current?.click()}
              title="Attach Official Document Photo or Image ID"
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer flex items-center justify-center"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Attach / Record Audio */}
            <button
              type="button"
              onClick={handleToggleAudioRecord}
              title={isRecording ? "Stop Voice Recording" : "Record Voice Prompt or Upload Audio"}
              className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${
                isRecording 
                  ? 'bg-red-100 dark:bg-red-950/45 text-red-600 dark:text-red-400 animate-pulse font-bold' 
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden file inputs */}
          <input type="file" ref={docInputRef} onChange={handleDocChange} accept=".pdf,.doc,.docx,.txt,.csv,.json" className="hidden" />
          <input type="file" ref={imgInputRef} onChange={handleImgChange} accept="image/*" className="hidden" />
          <input type="file" ref={audioInputRef} onChange={handleAudioChange} accept="audio/*" className="hidden" />

          {/* Text input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            placeholder={isRecording ? "🔴 Recording voice dictation... Click mic to finish" : "Ask directly or search authentic Belgian registries..."}
            className="flex-1 h-12 bg-transparent focus:outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-all"
          />

          {/* Right Controls: Photo Analyzer Shortcut + Submit Button */}
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <button
              type="button"
              onClick={onOpenPhotoModal}
              title="Official Document Photo Analyzer"
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer hidden sm:flex items-center text-xs font-bold gap-1"
            >
              <span className="text-[10px] border border-neutral-300 dark:border-neutral-800 px-1.5 py-0.5 rounded uppercase font-mono">ID Scan</span>
            </button>

            <button
              type="submit"
              disabled={loading || (!text.trim() && !hasAttachments)}
              className="p-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-neutral-900 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-center mt-2.5 text-[9px] text-neutral-500 uppercase tracking-widest font-bold font-mono">
          Federal Gateway Protected • Direct Registry Answers • No External Redirects Required
        </p>
      </div>
    </footer>
  );
}
