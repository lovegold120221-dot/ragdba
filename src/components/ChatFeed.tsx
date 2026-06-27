import { useRef, useEffect, useState } from 'react';
import { ExternalLink, Check, AlertTriangle, ShieldCheck, Sparkles, Loader2, Copy, Search, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { MVP_QUESTIONS_LIST } from '../data/officialRegistry';

interface ChatFeedProps {
  messages: ChatMessage[];
  loading: boolean;
  onQuickQuestion: (q: string) => void;
  userInitials?: string;
  userPhoto?: string | null;
  language: Language;
  speechAutoPlay: boolean;
}

function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  // Remove markdown code blocks
  let cleaned = text.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  // Remove markdown links [Label](url) -> Label
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  // Remove bold/italic stars
  cleaned = cleaned.replace(/[\*_]/g, '');
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  // Remove list bullets
  cleaned = cleaned.replace(/^\s*[\-\*\+]\s+/gm, '');
  // Remove numbered lists prefix
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

export function ChatFeed({
  messages,
  loading,
  onQuickQuestion,
  userInitials = 'JD',
  userPhoto,
  language,
  speechAutoPlay
}: ChatFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Clean up active audio on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

  const handlePlayPauseGeminiAudio = async (msgId: string, content: string, ttsAudio?: string) => {
    // If this message is already playing, stop it
    if (playingMsgId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setPlayingMsgId(null);
      return;
    }

    // Stop any currently playing audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    try {
      let audioUrl = '';
      
      if (ttsAudio) {
        audioUrl = ttsAudio.startsWith('data:') ? ttsAudio : `data:audio/aac;base64,${ttsAudio}`;
      } else {
        // Fallback: fetch from /api/tts if not already present
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content })
        });
        const data = await response.json();
        if (data.audio) {
          audioUrl = data.audio.startsWith('data:') ? data.audio : `data:audio/aac;base64,${data.audio}`;
        } else {
          return;
        }
      }

      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      setPlayingMsgId(msgId);
      
      audio.onended = () => {
        if (activeAudioRef.current === audio) {
          setPlayingMsgId(null);
          activeAudioRef.current = null;
        }
      };
      
      audio.onerror = () => {
        if (activeAudioRef.current === audio) {
          setPlayingMsgId(null);
          activeAudioRef.current = null;
        }
      };

      await audio.play();
    } catch (err) {
      console.error('Error playing Gemini audio:', err);
      setPlayingMsgId(null);
      activeAudioRef.current = null;
    }
  };

  // Auto-play effect when new assistant responses are appended
  const lastMsgRef = useRef<string | null>(null);
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.id !== lastMsgRef.current) {
        lastMsgRef.current = lastMsg.id;
        
        // Trigger Gemini Live audio auto-play programmatically if enabled
        if (speechAutoPlay) {
          handlePlayPauseGeminiAudio(lastMsg.id, lastMsg.content, lastMsg.ttsAudio);
        }
      }
    } else {
      // Clear last msg ref when messages list is emptied
      lastMsgRef.current = null;
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setPlayingMsgId(null);
    }
  }, [messages, speechAutoPlay]);

  return (
    <section className="flex-1 overflow-y-auto p-4 sm:p-12 bg-[#FBFBFB] dark:bg-neutral-950 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Welcome State */}
        {messages.length === 0 && (
          <div className="text-center py-8 sm:py-16 space-y-6 animate-fade-in">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon Logo" className="w-16 h-16 mx-auto drop-shadow-md" />
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Eburon NL Data RAG Assistant
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
                Ask anything about starting a company, residence procedures, VAT filings on MyMinfin, Crossroads Bank for Enterprises (CBE), or authentic public DCAT datasets.
              </p>
            </div>

            {/* Quick Clicks Grid */}
            <div className="pt-6">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-4">
                Common Inquiries
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto text-left">
                {MVP_QUESTIONS_LIST.slice(0, 6).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onQuickQuestion(q)}
                    className="p-3 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-100 font-medium transition-all shadow-2xs hover:shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <span className="text-[#FFD700] font-bold group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.map(msg => {
          const isUser = msg.role === 'user';

          if (isUser) {
            return (
              <div key={msg.id} className="flex gap-4 animate-fade-in justify-end sm:justify-start">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0 flex items-center justify-center text-[10px] font-bold text-neutral-700 dark:text-neutral-300 overflow-hidden shadow-2xs order-2 sm:order-1">
                  {userPhoto ? (
                    <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="pt-1 order-1 sm:order-2 max-w-[85%] sm:max-w-none">
                  <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900 sm:bg-transparent px-4 py-3 sm:p-0 rounded-2xl sm:rounded-none">
                    {msg.content}
                  </p>
                  {msg.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-w-sm shadow-sm">
                      <img src={msg.imageUrl} alt="Uploaded document" className="w-full max-h-60 object-contain bg-white dark:bg-neutral-900" />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Assistant Card Response
          return (
            <div key={msg.id} className="flex gap-4 animate-fade-in">
              <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon" className="w-8 h-8 rounded-full shrink-0 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1 shadow-2xs" />
              <div className="pt-1 space-y-6 w-full">
                {/* Header Controls (Thinking Indicator & Audio Button) */}
                <div className="flex items-center justify-between">
                  {msg.isThinking ? (
                    <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium">
                      <Sparkles className="w-3 h-3 text-[#E30613] dark:text-red-500" />
                      <span>Comprehensive Analytical Reasoning Applied</span>
                    </div>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={() => handlePlayPauseGeminiAudio(msg.id, msg.content, msg.ttsAudio)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                      playingMsgId === msg.id
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-850 animate-pulse'
                        : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {playingMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                        <span>Mute Response</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                        <span>Speak Response</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Explanation */}
                <div className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-100 prose prose-neutral dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
                  {msg.content}
                </div>

                {/* Responsible Branch Card */}
                {msg.responsibleBranch && (
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs border-l-4 border-l-[#FFD700]">
                    <div className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-2 tracking-widest flex items-center justify-between">
                      <span>Responsible Branch</span>
                      {msg.confidence && (
                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{msg.confidence}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white text-sm">{msg.responsibleBranch}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Official Authentic Source Registry</p>
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {msg.responsibleBranch.toLowerCase().includes('municipal') ? 'MUNICIPAL' : msg.responsibleBranch.toLowerCase().includes('region') ? 'REGIONAL' : 'FEDERAL'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Requirements Grid & Login Method */}
                {(msg.requirements?.length || msg.loginMethod) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {msg.requirements && msg.requirements.length > 0 && (
                      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-3 tracking-widest">
                            What you need
                          </div>
                          <ul className="text-xs space-y-2.5 text-neutral-700 dark:text-neutral-300">
                            {msg.requirements.map((req, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2 leading-normal">
                                <span className="text-green-600 dark:text-green-400 font-bold shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {msg.loginMethod && (
                      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-3 tracking-widest">
                            Login Method
                          </div>
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 bg-[#E30613] rounded flex items-center justify-center text-white font-bold italic text-xs shadow-xs shrink-0">
                              i
                            </div>
                            <span className="text-xs font-bold text-neutral-900 dark:text-white">{msg.loginMethod}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                            {msg.loginRequired ? 'Authentication required for digital government submission.' : 'Open access public registry service.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Procedure Steps */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500 tracking-widest">
                      Procedure Steps
                    </div>
                    <div className="space-y-2">
                      {msg.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex gap-3.5 text-xs bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded-lg border border-neutral-100 dark:border-neutral-800 items-start">
                          <span className="font-bold text-neutral-400 dark:text-neutral-500 font-mono shrink-0">
                            {String(sIdx + 1).padStart(2, '0')}
                          </span>
                          <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regional Variation Alert */}
                {msg.regionalWarning && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex gap-3 shadow-2xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      <span className="font-bold italic">Regional Variation: </span>
                      {msg.regionalWarning}
                    </p>
                  </div>
                )}

                {/* Related Questions section */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <div className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500 tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-red-600 dark:text-red-500" />
                      <span>Suggested Related Questions</span>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => onQuickQuestion(q)}
                          className="px-3.5 py-2 text-xs bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-xl transition-all shadow-3xs flex items-center gap-2 cursor-pointer text-left font-medium hover:scale-[1.01] active:scale-95 duration-100"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500 shrink-0"></span>
                          <span className="truncate">{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Native Search & Registry Feed Controls (No external navigation needed) */}
                <div className="flex flex-col gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onQuickQuestion(`Synthesize exact steps & requirements from ${msg.officialSource || 'authentic registry'} without redirecting`)}
                      className="text-xs font-bold bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ask AI: Deep Dive on {msg.officialSource || 'Registry'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickQuestion("What are the exact MyMinfin VAT and tax return filing steps?")}
                      className="text-xs font-bold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Search className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                      <span>Native Search: MyMinfin Rules</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickQuestion("Query CBE enterprise database for registration criteria")}
                      className="text-xs font-bold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Search className="w-3.5 h-3.5 text-sky-600 dark:text-sky-500" />
                      <span>Native Search: CBE Registry</span>
                    </button>
                  </div>

                  {/* If users truly only need the URL, provide it cleanly without pushing them away */}
                  {msg.sourceUrl && (
                    <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono mt-1">
                      <span className="truncate text-neutral-600 dark:text-neutral-400 max-w-[85%]" title={msg.sourceUrl}>Registry Endpoint: {msg.sourceUrl}</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(msg.sourceUrl || '')}
                        title="Copy Registry URL"
                        className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1 font-sans font-bold cursor-pointer ml-2 shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex gap-4 animate-fade-in items-center">
            <div className="w-8 h-8 rounded-full bg-black shrink-0 flex items-center justify-center text-white">
              <Loader2 className="w-4 h-4 animate-spin text-[#FFD700]" />
            </div>
            <p className="text-xs font-medium text-neutral-500 animate-pulse font-mono">
              Retrieving verified Belgian government data & authentic sources...
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </section>
  );
}
