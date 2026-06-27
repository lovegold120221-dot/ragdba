import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatFeed } from './components/ChatFeed';
import { InputComposer } from './components/InputComposer';
import { PhotoAnalyzerModal, RegistryModal, KnowledgeGraphModal, AdminDashboardModal } from './components/Modals';
import { ChatMessage, ChatSession, Language, ThinkingLevel, RagDocument } from './types';
import { auth, onAuthStateChanged, User, saveChatSession, saveChatMessage, getUserSessions, getSessionMessages, saveRagDocument, getUserRagDocuments, deleteRagDocument } from './lib/firebase';

const GATEWAY_USER = {
  uid: 'federal-citizen-node',
  displayName: 'Belgian Citizen Node',
  email: 'citizen@gateway.belgium.be',
  photoURL: 'https://eburon.ai/icon-eburon.svg'
};

export default function App() {
  const [user, setUser] = useState<User | null>(GATEWAY_USER as any);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('default-sess');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('EN');
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>('LOW');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [uploadingRag, setUploadingRag] = useState(false);
  const [speechAutoPlay, setSpeechAutoPlay] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('eburon_tts_autoplay');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('eburon_theme');
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('eburon_theme', theme);
    } catch (err) {
      console.error(err);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleToggleSpeechAutoPlay = () => {
    setSpeechAutoPlay(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem('eburon_tts_autoplay', String(newVal));
      } catch (err) {
        console.error(err);
      }
      return newVal;
    });
  };

  // Modals
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auth & Data Initializer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      const activeUser = u || (GATEWAY_USER as any);
      setUser(activeUser);
      
      const [userSess, userDocs] = await Promise.all([
        getUserSessions(activeUser.uid),
        getUserRagDocuments(activeUser.uid)
      ]);
      setRagDocuments(userDocs);

      if (userSess.length > 0) {
        setSessions(userSess);
        setActiveSessionId(userSess[0].id);
      } else {
        const newSess: ChatSession = {
          id: 'sess-' + Date.now(),
          userId: activeUser.uid,
          title: 'General Belgium Inquiry',
          language: 'EN',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setSessions([newSess]);
        setActiveSessionId(newSess.id);
        await saveChatSession(newSess);
      }
    });
    return unsub;
  }, []);

  // Fetch messages when session changes
  useEffect(() => {
    async function loadMsgs() {
      if (!activeSessionId) return;
      const msgs = await getSessionMessages(activeSessionId);
      setMessages(msgs);
    }
    loadMsgs();
  }, [activeSessionId]);

  async function handleUploadRagDoc(file: File) {
    const activeUser = user || GATEWAY_USER as any;
    setUploadingRag(true);
    try {
      const text = await file.text();
      const res = await fetch('/api/rag/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, content: text })
      });
      if (!res.ok) throw new Error("Processing failed");
      const data = await res.json();
      
      const newDoc: RagDocument = {
        id: 'rag-' + Date.now(),
        userId: activeUser.uid,
        fileName: data.fileName,
        fileType: data.fileType,
        summary: data.summary,
        content: data.content || text,
        embedding: data.embedding,
        createdAt: Date.now()
      };
      await saveRagDocument(newDoc);
      setRagDocuments(prev => [newDoc, ...prev]);
    } catch (err) {
      console.error("RAG upload error:", err);
      alert("Failed to process document embedding.");
    } finally {
      setUploadingRag(false);
    }
  }

  async function handleDeleteRagDoc(docId: string) {
    await deleteRagDocument(docId);
    setRagDocuments(prev => prev.filter(d => d.id !== docId));
  }

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
          history: messages,
          ragDocuments
        })
      });

      const data = await res.json();

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
        suggestedQuestions: data.suggestedQuestions,
        isThinking: thinkingLevel === 'HIGH',
        createdAt: Date.now(),
        ttsAudio: data.ttsAudio
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
    <div className="flex h-screen w-full bg-[#FBFBFB] dark:bg-neutral-950 font-sans text-[#1A1A1A] dark:text-neutral-100 overflow-hidden antialiased transition-colors duration-200">
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
        isCollapsed={isSidebarCollapsed}
        ragDocuments={ragDocuments}
        onUploadRagDoc={handleUploadRagDoc}
        onDeleteRagDoc={handleDeleteRagDoc}
        uploadingRag={uploadingRag}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          language={language}
          onSelectLanguage={setLanguage}
          thinkingLevel={thinkingLevel}
          onToggleThinking={handleToggleThinking}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          speechAutoPlay={speechAutoPlay}
          onToggleSpeechAutoPlay={handleToggleSpeechAutoPlay}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <ChatFeed
          messages={messages}
          loading={loading}
          onQuickQuestion={(q) => handleSendMessage(q)}
          userInitials={user?.email?.[0].toUpperCase() || 'NL'}
          userPhoto={user?.photoURL}
          language={language}
          speechAutoPlay={speechAutoPlay}
        />

        <InputComposer
          onSendMessage={handleSendMessage}
          loading={loading}
          onOpenPhotoModal={() => setIsPhotoOpen(true)}
          onUploadRagDoc={handleUploadRagDoc}
          language={language}
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
