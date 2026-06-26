import { useRef, useEffect } from 'react';
import { ExternalLink, Check, AlertTriangle, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { MVP_QUESTIONS_LIST } from '../data/officialRegistry';

interface ChatFeedProps {
  messages: ChatMessage[];
  loading: boolean;
  onQuickQuestion: (q: string) => void;
  userInitials?: string;
  userPhoto?: string | null;
}

export function ChatFeed({
  messages,
  loading,
  onQuickQuestion,
  userInitials = 'JD',
  userPhoto
}: ChatFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <section className="flex-1 overflow-y-auto p-4 sm:p-12 bg-[#FBFBFB] custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Welcome State / MVP Quick Clicks */}
        {messages.length === 0 && (
          <div className="text-center py-8 sm:py-16 space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-black text-[#FFD700] rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-neutral-800">
              <Sparkles className="w-8 h-8 text-[#E30613]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Eburon BE Data
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
                Ask anything about starting a company, residence procedures, VAT filings on MyMinfin, Crossroads Bank for Enterprises (CBE), or public DCAT datasets.
              </p>
            </div>

            {/* Quick Clicks Grid */}
            <div className="pt-6">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4">
                Suggested Inquiries
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto text-left">
                {MVP_QUESTIONS_LIST.slice(0, 6).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onQuickQuestion(q)}
                    className="p-3 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-xl text-xs text-neutral-800 font-medium transition-all shadow-2xs hover:shadow-sm flex items-center justify-between group cursor-pointer"
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
                <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-neutral-700 overflow-hidden shadow-2xs order-2 sm:order-1">
                  {userPhoto ? (
                    <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="pt-1 order-1 sm:order-2 max-w-[85%] sm:max-w-none">
                  <p className="text-sm leading-relaxed text-neutral-800 bg-neutral-100 sm:bg-transparent px-4 py-3 sm:p-0 rounded-2xl sm:rounded-none">
                    {msg.content}
                  </p>
                  {msg.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-neutral-200 max-w-sm shadow-sm">
                      <img src={msg.imageUrl} alt="Uploaded document" className="w-full max-h-60 object-contain bg-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Assistant Card Response (Strictly adopting Clean Minimalism theme)
          return (
            <div key={msg.id} className="flex gap-4 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-black shrink-0 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                EB
              </div>
              <div className="pt-1 space-y-6 w-full">
                {/* Thinking Indicator */}
                {msg.isThinking && (
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium">
                    <Sparkles className="w-3 h-3 text-[#E30613]" />
                    <span>Deep Thinking Analysis Applied</span>
                  </div>
                )}

                {/* Main Explanation */}
                <div className="text-sm leading-relaxed text-neutral-800 prose prose-neutral max-w-none prose-p:my-2 prose-headings:my-3">
                  {msg.content}
                </div>

                {/* Responsible Branch Card */}
                {msg.responsibleBranch && (
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs border-l-4 border-l-[#FFD700]">
                    <div className="text-[10px] font-bold uppercase text-neutral-400 mb-2 tracking-widest flex items-center justify-between">
                      <span>Responsible Branch</span>
                      {msg.confidence && (
                        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{msg.confidence}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-neutral-900 text-sm">{msg.responsibleBranch}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">Official Authentic Source Registry</p>
                      </div>
                      <div className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {msg.responsibleBranch.toLowerCase().includes('municipal') ? 'MUNICIPAL' : msg.responsibleBranch.toLowerCase().includes('region') ? 'REGIONAL' : 'FEDERAL'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Requirements Grid & Login Method */}
                {(msg.requirements?.length || msg.loginMethod) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {msg.requirements && msg.requirements.length > 0 && (
                      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-neutral-400 mb-3 tracking-widest">
                            What you need
                          </div>
                          <ul className="text-xs space-y-2.5 text-neutral-700">
                            {msg.requirements.map((req, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2 leading-normal">
                                <span className="text-green-600 font-bold shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {msg.loginMethod && (
                      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-neutral-400 mb-3 tracking-widest">
                            Login Method
                          </div>
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 bg-[#E30613] rounded flex items-center justify-center text-white font-bold italic text-xs shadow-xs shrink-0">
                              i
                            </div>
                            <span className="text-xs font-bold text-neutral-900">{msg.loginMethod}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 leading-relaxed">
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
                    <div className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">
                      Procedure Steps
                    </div>
                    <div className="space-y-2">
                      {msg.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex gap-3.5 text-xs bg-neutral-50 p-3.5 rounded-lg border border-neutral-100 items-start">
                          <span className="font-bold text-neutral-400 font-mono shrink-0">
                            {String(sIdx + 1).padStart(2, '0')}
                          </span>
                          <p className="text-neutral-800 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regional Variation Alert */}
                {msg.regionalWarning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 shadow-2xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <span className="font-bold italic">Regional Variation: </span>
                      {msg.regionalWarning}
                    </p>
                  </div>
                )}

                {/* Footer Official Link Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100">
                  {msg.sourceUrl ? (
                    <a
                      href={msg.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold bg-[#1A1A1A] hover:bg-black text-white px-4 py-2 rounded-full uppercase tracking-tighter inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>View Official Source: {msg.officialSource || 'belgium.be'}</span>
                      <ExternalLink className="w-3 h-3 text-[#FFD700]" />
                    </a>
                  ) : (
                    <a
                      href="https://www.belgium.be"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold bg-[#1A1A1A] hover:bg-black text-white px-4 py-2 rounded-full uppercase tracking-tighter inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>View Official Source: belgium.be</span>
                      <ExternalLink className="w-3 h-3 text-[#FFD700]" />
                    </a>
                  )}

                  <a
                    href="https://www.myminfin.be"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 px-4 py-2 rounded-full uppercase tracking-tighter inline-flex items-center gap-1.5 transition-all"
                  >
                    <span>Open MyMinfin</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>

                  <a
                    href="https://kbopub.economie.fgov.be"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 px-4 py-2 rounded-full uppercase tracking-tighter inline-flex items-center gap-1.5 transition-all"
                  >
                    <span>CBE Public Search</span>
                  </a>
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
