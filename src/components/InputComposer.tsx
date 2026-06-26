import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Mic, X } from 'lucide-react';

interface InputComposerProps {
  onSendMessage: (text: string, imageUrl?: string) => void;
  loading: boolean;
  onOpenPhotoModal: () => void;
}

export function InputComposer({
  onSendMessage,
  loading,
  onOpenPhotoModal
}: InputComposerProps) {
  const [text, setText] = useState('');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() && !selectedImg) return;
    if (loading) return;

    onSendMessage(text, selectedImg || undefined);
    setText('');
    setSelectedImg(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedImg(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <footer className="px-4 sm:px-12 py-4 flex flex-col items-center justify-center bg-[#FBFBFB] shrink-0 border-t border-neutral-100/60">
      <div className="max-w-3xl w-full relative">
        {/* Uploaded image preview tag */}
        {selectedImg && (
          <div className="absolute -top-14 left-4 bg-white border border-neutral-200 p-1.5 rounded-lg shadow-sm flex items-center gap-2 z-10 animate-fade-in">
            <img src={selectedImg} alt="Preview" className="w-10 h-10 object-cover rounded" />
            <span className="text-[10px] text-neutral-600 font-medium">Document attached</span>
            <button 
              type="button"
              onClick={() => setSelectedImg(null)} 
              className="p-1 hover:bg-neutral-100 rounded text-neutral-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            placeholder="Ask about taxes, residence, or business in Belgium..."
            className="w-full h-14 pl-5 sm:pl-6 pr-32 bg-white border border-neutral-200 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm text-neutral-900 transition-all placeholder:text-neutral-400"
          />

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
            {/* Image Upload Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Belgian official document or photo"
              className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Photo Analysis Feature Trigger */}
            <button
              type="button"
              onClick={onOpenPhotoModal}
              title="AI Document Analyzer (Upload & Analyze)"
              className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-400 hover:text-[#E30613] cursor-pointer hidden sm:block"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!text.trim() && !selectedImg)}
              className="p-3 bg-black hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-black text-white rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-5 h-5" />
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
