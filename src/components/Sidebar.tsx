import { useState } from 'react';
import { Plus, Database, ShieldAlert, Network, LogIn, LogOut, FileText, CheckCircle2 } from 'lucide-react';
import { ChatSession, Language } from '../types';
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
  onCloseMobile
}: SidebarProps) {
  const [authLoading, setAuthLoading] = useState(false);

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

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0F0F0F] text-white flex flex-col p-6 transition-transform duration-300 md:relative md:translate-x-0
    ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon" className="w-8 h-8 shrink-0" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">Eburon <span className="text-[#FFD700]">BE</span></h1>
              <p className="text-[9px] text-white/50 uppercase tracking-wider font-mono">Official Data Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={() => { onNewChat(); onCloseMobile(); }}
          className="w-full py-2.5 px-4 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 mb-6 shadow-xs cursor-pointer group"
        >
          <Plus className="w-4 h-4 text-[#FFD700] group-hover:scale-110 transition-transform" />
          <span>New Assistant Chat</span>
        </button>

        {/* Navigation / Recent Inquiries */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar mb-6">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2.5 px-1 font-semibold flex items-center justify-between">
            <span>Recent Inquiries</span>
            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">{sessions.length}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-3 rounded-lg border border-white/5 bg-white/2 text-center text-xs text-white/40 italic">
              No saved inquiries. Start a conversation below!
            </div>
          ) : (
            sessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => { onSelectSession(s.id); onCloseMobile(); }}
                  className={`w-full text-left p-2.5 text-xs rounded-lg transition-all flex items-center gap-2.5 cursor-pointer truncate ${
                    isActive 
                      ? 'bg-white/15 text-white font-medium border-l-2 border-l-[#FFD700]' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FFD700]' : 'text-white/40'}`} />
                  <span className="truncate">{s.title || 'Untitled Inquiry'}</span>
                </button>
              );
            })
          )}
        </nav>

        {/* Government Data Modules & Admin Tools */}
        <div className="space-y-1.5 pt-3 border-t border-white/10 mb-6">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 px-1 font-semibold">
            Authentic Registries
          </div>
          
          <button 
            onClick={() => { onOpenPhotoAnalyzer(); onCloseMobile(); }}
            className="w-full text-left px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />
            <span>Analyze Official Doc / ID</span>
          </button>

          <button 
            onClick={() => { onOpenRegistry(); onCloseMobile(); }}
            className="w-full text-left px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-sky-400" />
            <span>Source & Service Registry</span>
          </button>

          <button 
            onClick={() => { onOpenGraph(); onCloseMobile(); }}
            className="w-full text-left px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Network className="w-4 h-4 text-emerald-400" />
            <span>Belgian Knowledge Graph</span>
          </button>

          <button 
            onClick={() => { onOpenAdmin(); onCloseMobile(); }}
            className="w-full text-left px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-[#E30613]" />
            <span>Admin Control Dashboard</span>
          </button>
        </div>

        {/* Firebase Authentication Status */}
        <div className="pt-4 border-t border-white/10 mb-4">
          {user ? (
            <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full shrink-0 border border-white/20" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#FFD700] text-black font-bold text-xs flex items-center justify-center shrink-0">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0 truncate">
                  <p className="text-xs font-medium truncate">{user.displayName || 'Authenticated User'}</p>
                  <p className="text-[10px] text-white/40 truncate font-mono">Firebase CSAM Auth</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>{authLoading ? 'Connecting...' : 'Sign in with Google / CSAM'}</span>
            </button>
          )}
        </div>

        {/* Mandatory Footer Disclaimer */}
        <div className="mt-auto">
          <p className="text-[10px] text-white/30 leading-relaxed italic border-t border-white/5 pt-3">
            Eburon BE Data provides guidance using official Belgian public sources. Not an official government website.
          </p>
        </div>
      </aside>
    </>
  );
}
