import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatFeed } from './components/ChatFeed';
import { InputComposer } from './components/InputComposer';
import { PhotoAnalyzerModal, RegistryModal, KnowledgeGraphModal, AdminDashboardModal } from './components/Modals';
import { ChatMessage, ChatSession, Language, ThinkingLevel } from './types';
import { auth, onAuthStateChanged, User, saveChatSession, saveChatMessage, getUserSessions, getSessionMessages } from './lib/firebase';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('default-sess');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('EN');
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>('LOW');

  // Modals
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userSess = await getUserSessions(u.uid);
        if (userSess.length > 0) {
          setSessions(userSess);
          setActiveSessionId(userSess[0].id);
        } else {
          // Create initial session
          const newSess: ChatSession = {
            id: 'sess-' + Date.now(),
            userId: u.uid,
            title: 'General Belgium Inquiry',
            language: 'EN',
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          setSessions([newSess]);
          setActiveSessionId(newSess.id);
          await saveChatSession(newSess);
        }
      }
    });
    return unsub;
  }, []);

  // Fetch messages when session changes
  useEffect(() => {
    if (!user) return;
    async function loadMsgs() {
      const msgs = await getSessionMessages(activeSessionId);
      setMessages(msgs);
    }
    loadMsgs();
  }, [activeSessionId, user]);

  function handleNewChat() {
    const newId = 'sess-' + Date.now();
    const newSess: ChatSession = {
      id: newId,
      userId: user?.uid || 'anon',
      title: 'New Inquiry ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newId);
    setMessages([]);

    if (user) {
      saveChatSession(newSess);
    }
  }

  async function handleSendMessage(text: string, imageUrl?: string) {
    if (!text.trim() && !imageUrl) return;

    const userMsgId = 'msg-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text || 'Analyzed attached document',
      imageUrl,
      createdAt: Date.now()
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);

    if (user) {
      saveChatMessage(userMsg, activeSessionId, user.uid);
      // Update session title on first message
      if (messages.length === 0) {
        const title = text ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : 'Document Inquiry';
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title, updatedAt: Date.now() } : s));
        saveChatSession({
          id: activeSessionId,
          userId: user.uid,
          title,
          language,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: language === 'EN' ? 'English' : language === 'NL' ? 'Dutch' : language === 'FR' ? 'French' : 'German',
          thinkingLevel,
          history: messages
        })
      });

      const data = await res.json();

      // Handle API error responses (503/500 with { error: "..." })
      if (!res.ok && data.error) {
        setMessages(prev => [...prev, {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `Unable to process your request: ${data.error}`,
          createdAt: Date.now()
        }]);
        setLoading(false);
        return;
      }

      const aiMsgId = 'msg-ai-' + Date.now();
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: data.content || 'Please verify through the official portal.',
        responsibleBranch: data.responsibleBranch,
        loginRequired: data.loginRequired,
        loginMethod: data.loginMethod,
        officialSource: data.officialSource,
        sourceUrl: data.sourceUrl,
        requirements: data.requirements,
        steps: data.steps,
        regionalWarning: data.regionalWarning,
        confidence: data.confidence || 'High (Verified Official Source)',
        isThinking: thinkingLevel === 'HIGH',
        createdAt: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      if (user) {
        saveChatMessage(aiMsg, activeSessionId, user.uid);
      }
    } catch (err) {
      console.error('Chat API error:', err);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: "We encountered a temporary network delay reaching the Federal Gateway. Please verify official Belgian procedures directly at https://www.belgium.be.",
        createdAt: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleThinking() {
    setThinkingLevel(prev => prev === 'LOW' ? 'HIGH' : 'LOW');
  }

  return (
    <div className="flex h-screen w-full bg-[#FBFBFB] font-sans text-[#1A1A1A] overflow-hidden antialiased">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenGraph={() => setIsGraphOpen(true)}
        onOpenPhotoAnalyzer={() => setIsPhotoOpen(true)}
        user={user}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          language={language}
          onSelectLanguage={setLanguage}
          thinkingLevel={thinkingLevel}
          onToggleThinking={handleToggleThinking}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <ChatFeed
          messages={messages}
          loading={loading}
          onQuickQuestion={(q) => handleSendMessage(q)}
          userInitials={user?.email?.[0].toUpperCase() || 'JD'}
          userPhoto={user?.photoURL}
        />

        <InputComposer
          onSendMessage={handleSendMessage}
          loading={loading}
          onOpenPhotoModal={() => setIsPhotoOpen(true)}
        />
      </main>

      {/* Modals */}
      {isPhotoOpen && <PhotoAnalyzerModal onClose={() => setIsPhotoOpen(false)} />}
      {isRegistryOpen && <RegistryModal onClose={() => setIsRegistryOpen(false)} />}
      {isGraphOpen && <KnowledgeGraphModal onClose={() => setIsGraphOpen(false)} />}
      {isAdminOpen && <AdminDashboardModal onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}
