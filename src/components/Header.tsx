import { useState, useRef, useEffect } from 'react';
import { Menu, Zap, Brain, ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Language, ThinkingLevel } from '../types';

interface HeaderProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  thinkingLevel: ThinkingLevel;
  onToggleThinking: () => void;
  onOpenMobileSidebar: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  EN: 'English',
  NL: 'Nederlands',
  FR: 'Français',
  DE: 'Deutsch'
};

export function Header({
  language,
  onSelectLanguage,
  thinkingLevel,
  onToggleThinking,
  onOpenMobileSidebar,
  sidebarCollapsed,
  onToggleSidebar
}: HeaderProps) {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const isHighThinking = thinkingLevel === 'HIGH';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-20 shadow-2xs">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 text-neutral-700 md:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Sidebar collapse toggle (desktop) */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon" className="w-5 h-5 md:hidden" />
          <span className="text-xs font-semibold text-neutral-500 tracking-wider">EBURON NL DATA ASSISTANT</span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Reasoning Mode Toggle */}
        <button
          onClick={onToggleThinking}
          title={isHighThinking ? "Deep Analytical Reasoning Enabled" : "Concise Fast Mode Enabled"}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
            isHighThinking
              ? 'bg-amber-50 border-[#FFD700] text-amber-900 shadow-2xs'
              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          {isHighThinking ? (
            <>
              <Brain className="w-3.5 h-3.5 text-[#E30613] animate-pulse" />
              <span>Deep Reasoning</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-neutral-400" />
              <span>Fast Mode</span>
            </>
          )}
        </button>

        {/* Compact Language Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-800 transition-all cursor-pointer"
          >
            <span>{language}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg min-w-[140px] py-1 z-50 animate-fade-in">
              {(['EN', 'NL', 'FR', 'DE'] as Language[]).map(lang => {
                const isSelected = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => { onSelectLanguage(lang); setLangOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-bold">{lang}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">{LANGUAGE_LABELS[lang]}</span>
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E30613]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
