import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ChatSession, ChatMessage } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDjmcE7CiKrNpSnu20gFB2cG620HU36Zqg",
  authDomain: "gen-lang-client-0836251512.firebaseapp.com",
  databaseURL: "https://gen-lang-client-0836251512-default-rtdb.firebaseio.com",
  projectId: "gen-lang-client-0836251512",
  storageBucket: "gen-lang-client-0836251512.firebasestorage.app",
  messagingSenderId: "811711024905",
  appId: "1:811711024905:web:7890f044c63a8c991b8dd8",
  measurementId: "G-827PVM8HPV"
};

// Initialize Firebase (auth only)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };

// ---------------------------------------------------------------------------
// LocalDB — localStorage persistence replacing Firestore
// ---------------------------------------------------------------------------

const SESSIONS_KEY = 'eburon_sessions';
const MESSAGES_PREFIX = 'eburon_msgs_';

function getSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSessions(sessions: ChatSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function getMessagesKey(sessionId: string): string {
  return MESSAGES_PREFIX + sessionId;
}

function getMessages(sessionId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(getMessagesKey(sessionId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setMessages(sessionId: string, msgs: ChatMessage[]): void {
  localStorage.setItem(getMessagesKey(sessionId), JSON.stringify(msgs));
}

// ---------------------------------------------------------------------------
// Exported CRUD helpers (same interface as before, backed by localStorage)
// ---------------------------------------------------------------------------

export async function saveChatSession(session: ChatSession): Promise<void> {
  try {
    const sessions = getSessions();
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = { ...sessions[idx], ...session };
    } else {
      sessions.unshift(session);
    }
    setSessions(sessions);
  } catch (err) {
    console.error('Error saving session to LocalDB:', err);
  }
}

export async function getUserSessions(userId: string): Promise<ChatSession[]> {
  try {
    const sessions = getSessions();
    return sessions
      .filter(s => s.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('Error fetching user sessions from LocalDB:', err);
    return [];
  }
}

export async function saveChatMessage(message: ChatMessage, sessionId: string, userId: string): Promise<void> {
  try {
    const msgs = getMessages(sessionId);
    const enriched: ChatMessage & { sessionId: string; userId: string } = {
      ...message,
      sessionId,
      userId,
    };
    const idx = msgs.findIndex(m => m.id === message.id);
    if (idx >= 0) {
      msgs[idx] = enriched;
    } else {
      msgs.push(enriched);
    }
    setMessages(sessionId, msgs);
  } catch (err) {
    console.error('Error saving chat message to LocalDB:', err);
  }
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    return getMessages(sessionId).sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.error('Error fetching session messages from LocalDB:', err);
    return [];
  }
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    const sessions = getSessions().filter(s => s.id !== sessionId);
    setSessions(sessions);
    localStorage.removeItem(getMessagesKey(sessionId));
  } catch (err) {
    console.error('Error deleting chat session from LocalDB:', err);
  }
}
