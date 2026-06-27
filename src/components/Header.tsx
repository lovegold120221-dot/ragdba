import { Menu, Zap, Brain, Globe, PanelLeft, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { Language, ThinkingLevel } from '../types';

interface HeaderProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  thinkingLevel: ThinkingLevel;
  onToggleThinking: () => void;
  onOpenMobileSidebar: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  speechAutoPlay: boolean;
  onToggleSpeechAutoPlay: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({
  language,
  onSelectLanguage,
  thinkingLevel,
  onToggleThinking,
  onOpenMobileSidebar,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  speechAutoPlay,
  onToggleSpeechAutoPlay,
  theme,
  onToggleTheme
}: HeaderProps) {
  const isHighThinking = thinkingLevel === 'HIGH';

  return (
    <header className="h-16 bg-white dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-20 shadow-xs transition-colors duration-200">
      {/* Left section: Hamburger (mobile) + Desktop Collapse Toggle + Title Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 md:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {onToggleSidebarCollapse && (
          <button
            onClick={onToggleSidebarCollapse}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="hidden md:flex p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
          >
            <PanelLeft className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon" className="w-5 h-5 md:hidden" />
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100 tracking-wider font-mono">EBURON NL DATA ASSISTANT</span>
        </div>
      </div>

      {/* Right section: Thinking Mode Toggle + Auto-Read responses Toggle + Theme Toggle + Compact Language Selector */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Reasoning Mode Toggle */}
        <button
          onClick={onToggleThinking}
          title={isHighThinking ? "Deep Analytical Reasoning Enabled" : "Concise Fast Mode Enabled"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
            isHighThinking 
              ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 shadow-2xs' 
              : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          {isHighThinking ? (
            <>
              <Brain className="w-3.5 h-3.5 text-red-600 dark:text-red-500 animate-pulse" />
              <span className="hidden sm:inline">Deep Reasoning</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Fast Mode</span>
            </>
          )}
        </button>

        {/* Auto-Read responses Toggle */}
        <button
          onClick={onToggleSpeechAutoPlay}
          title={speechAutoPlay ? "Mute automatic voice reading" : "Enable automatic voice reading of responses"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
            speechAutoPlay 
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400 shadow-2xs hover:bg-amber-100/70 dark:hover:bg-amber-900/40' 
              : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          {speechAutoPlay ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 animate-pulse" />
              <span className="hidden sm:inline">Auto-Read On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
              <span className="hidden sm:inline">Auto-Read Off</span>
            </>
          )}
        </button>

        {/* High-Contrast Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? "Switch to High-Contrast Light Mode" : "Switch to High-Contrast Dark Mode"}
          aria-label="Toggle theme"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline font-bold text-xs">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline font-bold text-xs">Dark</span>
            </>
          )}
        </button>

        {/* Compact Language Selector Dropdown (Replaces noisy horizontal list) */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-bold text-neutral-900 dark:text-neutral-100 transition-colors shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300 shrink-0" />
          <select
            value={language}
            onChange={(e) => onSelectLanguage(e.target.value as Language)}
            aria-label="Select Language"
            className="bg-transparent focus:outline-none cursor-pointer font-bold text-neutral-900 dark:text-neutral-100 uppercase text-xs tracking-wide"
          >
            <option value="EN" className="font-bold dark:bg-neutral-900 dark:text-neutral-100">EN • English</option>
            <option value="NL" className="font-bold dark:bg-neutral-900 dark:text-neutral-100">NL • Nederlands</option>
            <option value="FR" className="font-bold dark:bg-neutral-900 dark:text-neutral-100">FR • Français</option>
            <option value="DE" className="font-bold dark:bg-neutral-900 dark:text-neutral-100">DE • Deutsch</option>
          </select>
        </div>
      </div>
    </header>
  );
}
