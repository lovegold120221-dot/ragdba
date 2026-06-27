import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Plus, Database, ShieldAlert, Network, LogIn, LogOut,
  FileText, CheckCircle2, Search, Upload, X, Image, File as FileIcon,
  AudioWaveform, ChevronLeft, ChevronRight, Trash2, ExternalLink, Loader2
} from 'lucide-react';
import { ChatSession, RagDocument } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, User } from '../lib/firebase';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onOpenRegistry: () => void;
  onOpenAdmin: () => void;
  onOpenGraph: () => void;
  onOpenPhotoAnalyzer: () => void;
  user: User | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  ragDocs: RagDocument[];
  onUploadRagDocument: (doc: RagDocument) => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onOpenRegistry,
  onOpenAdmin,
  onOpenGraph,
  onOpenPhotoAnalyzer,
  user,
  isOpenMobile,
  onCloseMobile,
  collapsed,
  ragDocs,
  onUploadRagDocument
}: SidebarProps) {
  const [authLoading, setAuthLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  async function handleLogin() {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  // Close upload menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target as Node)) {
        setUploadMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleFileForRag = useCallback(async (file: File, type: 'file' | 'image' | 'audio') => {
    if (!user) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const ragDoc: RagDocument = {
        id: 'rag-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        userId: user.uid,
        fileName: file.name,
        fileType: type,
        content: content,
        summary: `Uploaded ${type}: ${file.name}`,
        createdAt: Date.now()
      };
      onUploadRagDocument(ragDoc);
      setUploading(false);
      setUploadMenuOpen(false);
    };
    reader.onerror = () => setUploading(false);

    if (type === 'image') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  }, [user, onUploadRagDocument]);

  const filteredSessions = searchQuery
    ? sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sessions;

  const renderUploadMenu = () => (
    <div className="relative" ref={uploadMenuRef}>
      <button
        onClick={() => setUploadMenuOpen(v => !v)}
        disabled={!user || uploading}
        className="w-full py-2 px-3 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700"
      >
        {uploading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E30613]" />
        ) : (
          <Upload className="w-3.5 h-3.5 text-[#E30613]" />
        )}
        <span>{uploading ? 'Uploading...' : 'Upload to RAG Knowledge'}</span>
      </button>

      {uploadMenuOpen && (
        <div className="absolute left-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg min-w-[200px] py-1.5 z-50 animate-fade-in">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-3 hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
          >
            <FileIcon className="w-4 h-4 text-sky-500" />
            <div>
              <span className="font-medium">Upload document</span>
              <span className="text-[9px] text-neutral-400 block">PDF, DOC, TXT</span>
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
            onClick={() => {
              // Audio upload from file
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'audio/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileForRag(file, 'audio');
              };
              input.click();
            }}
            className="w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-3 hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
          >
            <AudioWaveform className="w-4 h-4 text-purple-500" />
            <div>
              <span className="font-medium">Upload audio</span>
              <span className="text-[9px] text-neutral-400 block">MP3, WAV, OGG</span>
            </div>
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileForRag(file, 'file');
        }}
        accept=".pdf,.doc,.docx,.txt,.csv,.json"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileForRag(file, 'image');
        }}
        accept="image/*"
        className="hidden"
      />
    </div>
  );

  // Collapsed sidebar: minimal version
  if (collapsed) {
    return (
      <>
        {isOpenMobile && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden" onClick={onCloseMobile} />
        )}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-[64px] bg-white border-r border-neutral-200 flex flex-col items-center py-4 gap-4 transition-transform duration-300
          md:relative md:translate-x-0
          ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}>
          <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon" className="w-6 h-6 shrink-0" />
          <div className="flex-1 flex flex-col items-center gap-2 w-full px-2">
            <button
              onClick={() => { onNewChat(); onCloseMobile(); }}
              className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 cursor-pointer"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="w-8 border-t border-neutral-100 my-1" />
            <button
              onClick={() => { onOpenPhotoAnalyzer(); onCloseMobile(); }}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              title="Analyze document"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onOpenRegistry(); onCloseMobile(); }}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              title="Registry"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onOpenGraph(); onCloseMobile(); }}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              title="Knowledge Graph"
            >
              <Network className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onOpenAdmin(); onCloseMobile(); }}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              title="Admin"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>
          {user ? (
            user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-neutral-200" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#FFD700] text-black font-bold text-xs flex items-center justify-center">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
            )
          ) : (
            <button onClick={handleLogin} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer" title="Sign in">
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </aside>
      </>
    );
  }

  // Expanded sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-[280px] bg-white text-neutral-900 flex flex-col p-5 transition-transform duration-300 border-r border-neutral-200
    md:relative md:translate-x-0
    ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
  `;

  return (
    <>
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden" onClick={onCloseMobile} />
      )}

      <aside className={sidebarClasses}>
        {/* Brand + Collapse button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon Logo" className="w-8 h-8 shrink-0" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-neutral-900">
                Eburon <span className="text-[#E30613]">NL Data</span>
              </h1>
              <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono">Authentic RAG Gateway</p>
            </div>
          </div>
          <button
            onClick={() => onCloseMobile()}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 md:hidden cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Native Search */}
        <div className="relative mb-4">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full h-9 pl-9 pr-3 bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => { onNewChat(); onCloseMobile(); }}
          className="w-full py-2.5 px-4 rounded-lg border border-neutral-300 text-sm font-medium hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 mb-4 cursor-pointer shadow-xs group"
        >
          <Plus className="w-4 h-4 text-[#E30613] group-hover:scale-110 transition-transform" />
          <span>New Assistant Chat</span>
        </button>

        {/* Navigation / Recent Inquiries */}
        <nav className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar mb-4">
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5 px-1 font-semibold flex items-center justify-between">
            <span>Recent Inquiries</span>
            <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{sessions.length}</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-center text-xs text-neutral-400 italic">
              {searchQuery ? 'No matching inquiries found.' : 'No saved inquiries. Start a conversation below!'}
            </div>
          ) : (
            filteredSessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => { onSelectSession(s.id); onCloseMobile(); }}
                  className={`w-full text-left p-2.5 text-xs rounded-lg transition-all flex items-center gap-2.5 cursor-pointer truncate ${
                    isActive
                      ? 'bg-amber-50 text-neutral-900 font-medium border-l-2 border-l-[#E30613]'
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#E30613]' : 'text-neutral-400'}`} />
                  <span className="truncate">{s.title || 'Untitled Inquiry'}</span>
                </button>
              );
            })
          )}
        </nav>

        {/* Upload to RAG */}
        <div className="mb-3">
          {renderUploadMenu()}
        </div>

        {/* RAG Documents list */}
        {ragDocs.length > 0 && (
          <div className="mb-3 max-h-[120px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 px-1 font-semibold">
              RAG Knowledge Base ({ragDocs.length})
            </div>
            {ragDocs.slice(0, 5).map(doc => (
              <div key={doc.id} className="flex items-center gap-2 px-2 py-1.5 bg-neutral-50 rounded-lg text-[10px]">
                {doc.fileType === 'image' ? <Image className="w-3 h-3 text-amber-500 shrink-0" /> :
                 doc.fileType === 'audio' ? <AudioWaveform className="w-3 h-3 text-purple-500 shrink-0" /> :
                 <FileIcon className="w-3 h-3 text-sky-500 shrink-0" />}
                <span className="truncate text-neutral-600">{doc.fileName}</span>
              </div>
            ))}
          </div>
        )}

        {/* Government Data Modules */}
        <div className="space-y-1 pt-3 border-t border-neutral-100 mb-4">
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2 px-1 font-semibold">
            Authentic Registries
          </div>

          <button
            onClick={() => { onOpenPhotoAnalyzer(); onCloseMobile(); }}
            className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#E30613]" />
            <span>Analyze Official Doc / ID</span>
          </button>

          <button
            onClick={() => { onOpenRegistry(); onCloseMobile(); }}
            className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-sky-600" />
            <span>Source & Service Registry</span>
          </button>

          <button
            onClick={() => { onOpenGraph(); onCloseMobile(); }}
            className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Network className="w-4 h-4 text-emerald-600" />
            <span>Belgian Knowledge Graph</span>
          </button>

          <button
            onClick={() => { onOpenAdmin(); onCloseMobile(); }}
            className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-[#E30613]" />
            <span>Admin Control Dashboard</span>
          </button>
        </div>

        {/* Sign-in / User section */}
        <div className="pt-3 border-t border-neutral-100">
          {user ? (
            <div className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full shrink-0 border border-neutral-200" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#FFD700] text-black font-bold text-xs flex items-center justify-center shrink-0">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0 truncate">
                  <p className="text-xs font-medium truncate text-neutral-800">{user.displayName || 'Authenticated User'}</p>
                  <p className="text-[10px] text-neutral-400 truncate font-mono">Firebase Auth</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 rounded transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer text-neutral-700"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E30613]" />
              <span>{authLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-auto pt-3">
          <p className="text-[10px] text-neutral-400 leading-relaxed italic border-t border-neutral-100 pt-3">
            Eburon NL Data provides guidance strictly using authentic Belgian public sources. Not an official government website.
          </p>
        </div>
      </aside>
    </>
  );
}
