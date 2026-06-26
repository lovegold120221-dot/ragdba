import { Menu, Zap, Brain } from 'lucide-react';
import { Language, ThinkingLevel } from '../types';

interface HeaderProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  thinkingLevel: ThinkingLevel;
  onToggleThinking: () => void;
  onOpenMobileSidebar: () => void;
}

export function Header({
  language,
  onSelectLanguage,
  thinkingLevel,
  onToggleThinking,
  onOpenMobileSidebar
}: HeaderProps) {
  const languages: Language[] = ['EN', 'NL', 'FR', 'DE'];

  const isHighThinking = thinkingLevel === 'HIGH';

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-20 shadow-2xs">
      {/* Left section: Hamburger (mobile) + Title Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 text-neutral-700 md:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 tracking-wider">EBURON BE DATA</span>
        </div>
      </div>

      {/* Right section: Thinking Mode Toggle + Language Selector */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Thinking Mode Switch */}
        <button
          onClick={onToggleThinking}
          title={isHighThinking ? "High Thinking Mode Enabled" : "Standard Low-Latency Mode"}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
            isHighThinking 
              ? 'bg-amber-50 border-[#FFD700] text-amber-900 shadow-2xs' 
              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          {isHighThinking ? (
            <>
              <Brain className="w-3.5 h-3.5 text-[#E30613] animate-pulse" />
              <span>High Thinking Active</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-neutral-400" />
              <span>Low-Latency Flash</span>
            </>
          )}
        </button>

        {/* Language Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium uppercase tracking-wider">
          {languages.map(lang => {
            const isSelected = language === lang;
            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                className={`transition-all cursor-pointer px-1 py-0.5 rounded ${
                  isSelected 
                    ? 'text-[#E30613] font-bold underline decoration-2 decoration-[#FFD700] underline-offset-4' 
                    : 'text-neutral-400 hover:text-neutral-800 opacity-60 hover:opacity-100'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
