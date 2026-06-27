import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Image, Mic, X, FileText, Music, Loader2 } from 'lucide-react';

interface InputComposerProps {
  onSendMessage: (text: string, imageUrl?: string) => void;
  loading: boolean;
  onOpenPhotoModal: () => void;
}

type AttachmentType = 'file' | 'image' | 'audio' | null;

export function InputComposer({
  onSendMessage,
  loading,
  onOpenPhotoModal
}: InputComposerProps) {
  const [text, setText] = useState('');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() && !selectedImg && !selectedFileName) return;
    if (loading) return;

    onSendMessage(text, selectedImg || undefined);
    setText('');
    setSelectedImg(null);
    setSelectedFileName(null);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(null);
    setAttachMenuOpen(false);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedImg(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImg(null);
    setSelectedFileName(file.name);
    setAttachMenuOpen(false);
    const reader = new FileReader();
    reader.onload = (evt) => {
      // For now, treat as text content
      const content = evt.target?.result as string;
      onSendMessage(`[Attached file: ${file.name}]\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``);
    };
    reader.readAsText(file);
  }

  // Audio recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64 = evt.target?.result as string;
          onSendMessage(`[Voice message attached]`, base64);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAttachMenuOpen(false);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  }, [onSendMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  // Close attach menu on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAttachMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="px-4 sm:px-12 py-4 flex flex-col items-center justify-center bg-[#FBFBFB] shrink-0 border-t border-neutral-100/60">
      <div className="max-w-3xl w-full relative">
        {/* Attachment preview tag */}
        {selectedImg && (
          <div className="absolute -top-14 left-4 bg-white border border-neutral-200 p-1.5 rounded-lg shadow-sm flex items-center gap-2 z-10 animate-fade-in">
            <Image className="w-4 h-4 text-neutral-500" />
            <img src={selectedImg} alt="Preview" className="w-8 h-8 object-cover rounded" />
            <span className="text-[10px] text-neutral-600 font-medium">Image attached</span>
            <button
              type="button"
              onClick={() => setSelectedImg(null)}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {selectedFileName && (
          <div className="absolute -top-14 left-4 bg-white border border-neutral-200 p-1.5 rounded-lg shadow-sm flex items-center gap-2 z-10 animate-fade-in">
            <FileText className="w-4 h-4 text-sky-500" />
            <span className="text-[10px] text-neutral-600 font-medium truncate max-w-[120px]">{selectedFileName}</span>
            <button
              type="button"
              onClick={() => setSelectedFileName(null)}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute -top-14 left-4 bg-red-50 border border-red-200 p-2 rounded-lg shadow-sm flex items-center gap-2 z-10 animate-fade-in">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-red-700">REC {formatDuration(recordingDuration)}</span>
            <button
              type="button"
              onClick={stopRecording}
              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded ml-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading || isRecording}
            placeholder="Ask about taxes, residence, or business in Belgium..."
            className="w-full h-14 pl-14 sm:pl-16 pr-14 bg-white border border-neutral-200 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm text-neutral-900 transition-all placeholder:text-neutral-400"
          />

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.csv,.json"
            className="hidden"
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={audioInputRef}
            accept="audio/*"
            className="hidden"
          />

          {/* Left side: Attach button with popup menu */}
          <div className="absolute left-1.5 top-1.5" ref={menuRef}>
            <button
              type="button"
              onClick={() => setAttachMenuOpen(v => !v)}
              title="Attach files, images, or record audio"
              className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Attachment type menu */}
            {attachMenuOpen && (
              <div className="absolute left-0 bottom-full mb-2 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 min-w-[180px] z-50 animate-fade-in">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-3 hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-sky-500" />
                  <div>
                    <span className="font-medium">Attach document</span>
                    <span className="text-[9px] text-neutral-400 block">PDF, DOC, TXT, CSV</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-3 hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
                >
                  <Image className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="font-medium">Upload image</span>
                    <span className="text-[9px] text-neutral-400 block">JPEG, PNG, WEBP</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-3 hover:bg-neutral-50 transition-colors cursor-pointer ${
                    isRecording ? 'text-red-600 bg-red-50' : 'text-neutral-700'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-purple-500'}`} />
                  <div>
                    <span className="font-medium">{isRecording ? 'Stop recording' : 'Record audio'}</span>
                    <span className="text-[9px] text-neutral-400 block">Voice prompt</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Right side: Submit button */}
          <div className="absolute right-1.5 top-1.5">
            <button
              type="submit"
              disabled={loading || isRecording || (!text.trim() && !selectedImg && !selectedFileName)}
              className="p-3 bg-black hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-black text-white rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>

        <p className="text-center mt-2.5 text-[9px] text-neutral-400 uppercase tracking-widest font-medium font-mono">
          Secure Access via Federal Gateway • Verified Sources Only
        </p>
      </div>
    </footer>
  );
}
