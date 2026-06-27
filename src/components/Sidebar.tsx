import React, { useState } from 'react';
import { Plus, Database, ShieldAlert, Network, FileText, CheckCircle2, Upload, Trash2, Loader2, LogIn, LogOut, FolderOpen } from 'lucide-react';
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
  isCollapsed?: boolean;
  ragDocuments?: RagDocument[];
  onUploadRagDoc?: (file: File) => Promise<void>;
  onDeleteRagDoc?: (docId: string) => Promise<void>;
  uploadingRag?: boolean;
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
  isCollapsed = false,
  ragDocuments = [],
  onUploadRagDoc,
  onDeleteRagDoc,
  uploadingRag = false
}: SidebarProps) {
  const [authLoading, setAuthLoading] = useState(false);
  const [localFolderPath, setLocalFolderPath] = useState<string | null>(() => {
    try {
      return localStorage.getItem('eburon_local_folder_path');
    } catch {
      return null;
    }
  });

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onUploadRagDoc) {
      onUploadRagDoc(file);
      e.target.value = '';
    }
  }

  async function handleFolderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0 && onUploadRagDoc) {
      const firstFile = files[0];
      const relativePath = firstFile.webkitRelativePath || '';
      const topFolder = relativePath.split('/')[0] || 'Local Folder';
      
      setLocalFolderPath(topFolder);
      try {
        localStorage.setItem('eburon_local_folder_path', topFolder);
      } catch (err) {
        console.error(err);
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.startsWith('.')) continue;
        try {
          await onUploadRagDoc(file);
        } catch (err) {
          console.error(`Failed to process folder file ${file.name}:`, err);
        }
      }
      e.target.value = '';
    }
  }

  async function handleSyncLocalFolder() {
    try {
      if (!('showDirectoryPicker' in window)) {
        // Fallback to hidden file-input webkitdirectory
        const fallbackInput = document.getElementById('eburon-folder-fallback-input');
        if (fallbackInput) {
          (fallbackInput as HTMLInputElement).click();
        } else {
          alert("The File System Access API is not supported in this browser.");
        }
        return;
      }

      const dirHandle = await (window as any).showDirectoryPicker();
      setLocalFolderPath(dirHandle.name);
      try {
        localStorage.setItem('eburon_local_folder_path', dirHandle.name);
      } catch (e) {}

      const filesToProcess: File[] = [];

      async function traverse(handle: any) {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            if (entry.name.startsWith('.')) continue;
            try {
              const file = await entry.getFile();
              filesToProcess.push(file);
            } catch (fileErr) {
              console.error(`Could not read file ${entry.name}:`, fileErr);
            }
          } else if (entry.kind === 'directory') {
            if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
            await traverse(entry);
          }
        }
      }

      await traverse(dirHandle);

      if (filesToProcess.length === 0) {
        alert("No files found in the selected folder.");
        return;
      }

      if (onUploadRagDoc) {
        for (const file of filesToProcess) {
          try {
            await onUploadRagDoc(file);
          } catch (err) {
            console.error(`Failed to process folder file ${file.name}:`, err);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('User aborted directory picker.');
        return;
      }
      console.warn('showDirectoryPicker error, trying fallback input:', err);
      const fallbackInput = document.getElementById('eburon-folder-fallback-input');
      if (fallbackInput) {
        (fallbackInput as HTMLInputElement).click();
      }
    }
  }

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border-r border-neutral-300 dark:border-neutral-800 flex flex-col transition-all duration-300 md:relative md:translate-x-0 shrink-0
    ${isOpenMobile ? 'translate-x-0 shadow-2xl w-[280px] p-6' : '-translate-x-full md:translate-x-0'}
    ${isCollapsed ? 'md:w-[72px] md:p-3' : 'md:w-[280px] md:p-6'}
  `;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-2xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Brand Logo Header */}
        <div className={`flex items-center mb-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon Logo" className="w-8 h-8 shrink-0" />
            {!isCollapsed && (
              <div>
                <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">Eburon <span className="text-red-600 dark:text-red-500">NL Data</span></h1>
                <p className="text-[9px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono font-semibold">Authentic RAG Gateway</p>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={() => { onNewChat(); onCloseMobile(); }}
          title="New Assistant Chat"
          className={`w-full py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mb-6 shadow-xs cursor-pointer group shrink-0 ${isCollapsed ? 'px-0' : 'px-4'}`}
        >
          <Plus className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
          {!isCollapsed && <span>New Assistant Chat</span>}
        </button>

        {/* Navigation / Recent Inquiries */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar mb-4">
          {!isCollapsed && (
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2.5 px-1 font-bold flex items-center justify-between">
              <span>Recent Inquiries</span>
              <span className="text-[9px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 rounded text-neutral-700 dark:text-neutral-300">{sessions.length}</span>
            </div>
          )}

          {sessions.length === 0 ? (
            !isCollapsed ? (
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-center text-xs text-neutral-500 dark:text-neutral-400 italic">
                No saved inquiries. Start a conversation below!
              </div>
            ) : null
          ) : (
            sessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => { onSelectSession(s.id); onCloseMobile(); }}
                  title={s.title || 'Inquiry'}
                  className={`w-full text-left p-2.5 text-xs rounded-lg transition-all flex items-center gap-2.5 cursor-pointer truncate ${
                    isActive 
                      ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white font-bold border-l-4 border-l-red-600 shadow-2xs' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 dark:hover:text-white dark:hover:bg-neutral-900'
                  } ${isCollapsed ? 'justify-center p-2' : ''}`}
                >
                  <FileText className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-600' : 'text-neutral-400 dark:text-neutral-500'}`} />
                  {!isCollapsed && <span className="truncate">{s.title || 'Untitled Inquiry'}</span>}
                </button>
              );
            })
          )}
        </nav>

        {/* Government Data Modules & Admin Tools */}
        <div className="space-y-1 pt-3 border-t border-neutral-200 dark:border-neutral-800 mb-4 shrink-0">
          {!isCollapsed && (
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 px-1 font-bold">
              Authentic Registries
            </div>
          )}
          
          <button 
            onClick={() => { onOpenPhotoAnalyzer(); onCloseMobile(); }}
            title="Analyze Official Doc / ID"
            className={`w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0" />
            {!isCollapsed && <span>Analyze Official Doc / ID</span>}
          </button>

          <button 
            onClick={() => { onOpenRegistry(); onCloseMobile(); }}
            title="Source & Service Registry"
            className={`w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <Database className="w-4 h-4 text-sky-600 dark:text-sky-500 shrink-0" />
            {!isCollapsed && <span>Source & Service Registry</span>}
          </button>

          <button 
            onClick={() => { onOpenGraph(); onCloseMobile(); }}
            title="Belgian Knowledge Graph"
            className={`w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <Network className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
            {!isCollapsed && <span>Belgian Knowledge Graph</span>}
          </button>

          <button 
            onClick={() => { onOpenAdmin(); onCloseMobile(); }}
            title="Admin Control Dashboard"
            className={`w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
            {!isCollapsed && <span>Admin Control Dashboard</span>}
          </button>
        </div>

        {/* Federal Gateway Connection Status */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 mb-3 shrink-0">
          <div className={`flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 ${isCollapsed ? 'flex-col gap-2' : ''}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                BE
              </div>
              {!isCollapsed && (
                <div className="min-w-0 truncate">
                  <p className="text-xs font-bold truncate text-neutral-900 dark:text-neutral-100">Federal Citizen Node</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold truncate font-mono">● ONLINE & VERIFIED</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Functionality (Below Sign-in with Google) */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 mb-2 shrink-0">
          {!isCollapsed ? (
            <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                  <span>RAG Upload</span>
                </span>
                <label className="text-[10px] bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-750 text-white px-2.5 py-1 rounded-md cursor-pointer flex items-center gap-1 font-bold transition-colors shadow-2xs">
                  <Upload className="w-3 h-3 text-amber-400" />
                  <span>Attach</span>
                  <input type="file" accept=".pdf,.txt,.doc,.docx,.csv,.json" onChange={handleFileChange} disabled={uploadingRag} className="hidden" />
                </label>
              </div>

              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                Upload official docs or rulings. AI will extract & answer queries based on this RAG data.
              </p>

              {uploadingRag && (
                <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-1.5 rounded flex items-center gap-2 animate-pulse font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600 dark:text-red-500" />
                  <span>Generating vector embeddings...</span>
                </div>
              )}

              <div className="max-h-28 overflow-y-auto space-y-1 custom-scrollbar pt-1">
                {ragDocuments.length === 0 ? (
                  <div className="text-[10px] text-neutral-400 italic text-center py-1">No RAG documents active.</div>
                ) : (
                  ragDocuments.map(doc => (
                    <div key={doc.id} className="p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-xs flex items-center justify-between gap-1 group shadow-2xs">
                      <div className="min-w-0 truncate">
                        <p className="font-bold text-neutral-900 dark:text-neutral-100 text-[11px] truncate" title={doc.fileName}>{doc.fileName}</p>
                        <p className="text-[9px] text-neutral-500 dark:text-neutral-400 truncate">{doc.summary || 'Vector ready'}</p>
                      </div>
                      {onDeleteRagDoc && (
                        <button onClick={() => onDeleteRagDoc(doc.id)} title="Remove RAG doc" className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0 cursor-pointer">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Local Folder Sync / Path Integration */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <button
                  type="button"
                  onClick={handleSyncLocalFolder}
                  disabled={uploadingRag}
                  className="w-full py-1.5 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                  <span>Sync Local Folder</span>
                </button>
                
                {/* Fallback hidden folder directory input */}
                <input
                  id="eburon-folder-fallback-input"
                  type="file"
                  {...{ webkitdirectory: "true", directory: "true" }}
                  multiple
                  onChange={handleFolderChange}
                  disabled={uploadingRag}
                  className="hidden"
                />
                
                {localFolderPath ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 rounded-lg p-1.5 text-[10px] font-medium">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="truncate">Path: <strong className="font-mono">/{localFolderPath}</strong></span>
                    </div>
                    <button
                      type="button"
                      title="Disconnect local path source"
                      onClick={() => {
                        setLocalFolderPath(null);
                        try {
                          localStorage.removeItem('eburon_local_folder_path');
                        } catch {}
                      }}
                      className="text-emerald-700 dark:text-emerald-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer p-0.5 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[9px] text-neutral-400 leading-tight text-center italic">
                    Configure local path directory as dynamic source.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <label title="Upload RAG Document" className="w-full py-2 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-800 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-red-600 dark:text-red-500" />
              <input type="file" accept=".pdf,.txt,.doc,.docx,.csv,.json" onChange={handleFileChange} disabled={uploadingRag} className="hidden" />
            </label>
          )}
        </div>

        {/* Google Authentication Elevate Status */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 mb-2 shrink-0">
          {user && user.uid !== 'federal-citizen-node' ? (
            <div className={`flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 ${isCollapsed ? 'flex-col gap-2' : ''}`}>
              <div className="flex items-center gap-2 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full shrink-0 border border-neutral-300 dark:border-neutral-700" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="min-w-0 truncate">
                    <p className="text-xs font-bold truncate text-neutral-900 dark:text-neutral-100">{user.displayName || 'Authenticated'}</p>
                    <p className="text-[9px] text-neutral-500 dark:text-neutral-400 truncate font-mono">Google Account</p>
                  </div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={authLoading}
              title="Sign in with Google / CSAM"
              className={`w-full py-2 px-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${isCollapsed ? 'px-0' : ''}`}
            >
              <LogIn className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span>{authLoading ? 'Connecting...' : 'Sign in with Google'}</span>}
            </button>
          )}
        </div>

        {/* Mandatory Footer Disclaimer */}
        {!isCollapsed && (
          <div className="mt-auto pt-2">
            <p className="text-[9px] text-neutral-400 leading-normal italic text-center">
              Guidance via authentic Belgian sources.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
