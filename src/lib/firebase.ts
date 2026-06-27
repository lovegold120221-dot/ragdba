import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { ChatSession, ChatMessage, RagDocument } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDjmcE7CiKrNpSnu20gFB2cG620HU36Zqg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0836251512.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://gen-lang-client-0836251512-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0836251512",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0836251512.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "811711024905",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:811711024905:web:7890f044c63a8c991b8dd8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-827PVM8HPV"
};

const databaseId = "remixed-firestore-database-id";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };

// Firestore Error Handling Interface and Enum
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || 'federal-citizen-node',
      email: auth.currentUser?.email || 'citizen@gateway.belgium.be',
      emailVerified: auth.currentUser?.emailVerified || true,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// LocalStorage Fallback helper functions
const LOCAL_SESSIONS_KEY = 'eburon_fallback_sessions';
const LOCAL_MESSAGES_KEY = 'eburon_fallback_messages';
const LOCAL_RAG_DOCS_KEY = 'eburon_fallback_rag_docs';

function getLocalSessions(): ChatSession[] {
  try {
    const data = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

function saveLocalSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {}
}

function getLocalMessages(): (ChatMessage & { sessionId: string; userId: string })[] {
  try {
    const data = localStorage.getItem(LOCAL_MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

function saveLocalMessages(messages: (ChatMessage & { sessionId: string; userId: string })[]) {
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  } catch (err) {}
}

function getLocalRagDocs(): RagDocument[] {
  try {
    const data = localStorage.getItem(LOCAL_RAG_DOCS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

function saveLocalRagDocs(docs: RagDocument[]) {
  try {
    localStorage.setItem(LOCAL_RAG_DOCS_KEY, JSON.stringify(docs));
  } catch (err) {}
}

// Helper to recursively strip undefined properties so Firestore doesn't throw errors
function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        newObj[key] = cleanUndefined(val);
      }
    }
    return newObj as T;
  }
  return obj;
}

// Firestore Helper Functions with Automatic Local Cache Fallbacks
export async function saveChatSession(session: ChatSession): Promise<void> {
  // Always update local cache first
  const local = getLocalSessions();
  const index = local.findIndex(s => s.id === session.id);
  if (index >= 0) {
    local[index] = session;
  } else {
    local.push(session);
  }
  saveLocalSessions(local);

  try {
    const sessionRef = doc(db, 'chatSessions', session.id);
    await setDoc(sessionRef, cleanUndefined(session), { merge: true });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `chatSessions/${session.id}`);
    } catch (e) {
      // Swallowed thrown error to prevent app crash but it was logged properly
    }
  }
}

export async function getUserSessions(userId: string): Promise<ChatSession[]> {
  try {
    const sessionsRef = collection(db, 'chatSessions');
    const q = query(sessionsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => doc.data() as ChatSession);
    const sorted = docs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    saveLocalSessions(sorted);
    return sorted;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'chatSessions');
    } catch (e) {
      // Swallowed thrown error to prevent app crash but it was logged properly
    }
    const local = getLocalSessions().filter(s => s.userId === userId);
    return local.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }
}

export async function saveChatMessage(message: ChatMessage, sessionId: string, userId: string): Promise<void> {
  // Exclude massive ttsAudio from persistence to stay within Firestore (1MB) and localStorage limits
  const { ttsAudio, ...messageWithoutAudio } = message;

  // Always update local cache first
  const local = getLocalMessages();
  const index = local.findIndex(m => m.id === message.id);
  const fullMsg = { ...messageWithoutAudio, sessionId, userId };
  if (index >= 0) {
    local[index] = fullMsg;
  } else {
    local.push(fullMsg);
  }
  saveLocalMessages(local);

  try {
    const msgRef = doc(db, 'chatMessages', message.id);
    await setDoc(msgRef, cleanUndefined({
      ...messageWithoutAudio,
      sessionId,
      userId
    }), { merge: true });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `chatMessages/${message.id}`);
    } catch (e) {
      // Swallowed thrown error to prevent app crash but it was logged properly
    }
  }
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    const msgsRef = collection(db, 'chatMessages');
    const q = query(msgsRef, where('sessionId', '==', sessionId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        role: data.role,
        content: data.content,
        responsibleBranch: data.responsibleBranch,
        loginRequired: data.loginRequired,
        loginMethod: data.loginMethod,
        officialSource: data.officialSource,
        sourceUrl: data.sourceUrl,
        requirements: data.requirements,
        steps: data.steps,
        regionalWarning: data.regionalWarning,
        confidence: data.confidence,
        suggestedQuestions: data.suggestedQuestions,
        imageUrl: data.imageUrl,
        imageAnalysis: data.imageAnalysis,
        isThinking: data.isThinking,
        ttsAudio: data.ttsAudio,
        createdAt: data.createdAt
      } as ChatMessage;
    });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'chatMessages');
    } catch (e) {
      // Swallowed thrown error to prevent app crash but it was logged properly
    }
    const local = getLocalMessages().filter(m => m.sessionId === sessionId);
    return local.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      responsibleBranch: m.responsibleBranch,
      loginRequired: m.loginRequired,
      loginMethod: m.loginMethod,
      officialSource: m.officialSource,
      sourceUrl: m.sourceUrl,
      requirements: m.requirements,
      steps: m.steps,
      regionalWarning: m.regionalWarning,
      confidence: m.confidence,
      suggestedQuestions: m.suggestedQuestions,
      imageUrl: m.imageUrl,
      imageAnalysis: m.imageAnalysis,
      isThinking: m.isThinking,
      ttsAudio: m.ttsAudio,
      createdAt: m.createdAt
    } as ChatMessage)).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  // Always update local cache first
  const local = getLocalSessions().filter(s => s.id !== sessionId);
  saveLocalSessions(local);
  const localMsgs = getLocalMessages().filter(m => m.sessionId !== sessionId);
  saveLocalMessages(localMsgs);

  try {
    await deleteDoc(doc(db, 'chatSessions', sessionId));
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, `chatSessions/${sessionId}`);
    } catch (e) {
      // Swallowed thrown error to prevent app crash but it was logged properly
    }
  }
}

export async function saveRagDocument(docItem: RagDocument): Promise<void> {
  // Always update local cache first
  const local = getLocalRagDocs();
  const index = local.findIndex(d => d.id === docItem.id);
  if (index >= 0) {
    local[index] = docItem;
  } else {
    local.push(docItem);
  }
  saveLocalRagDocs(local);

  try {
    const docRef = doc(db, 'ragDocuments', docItem.id);
    await setDoc(docRef, cleanUndefined(docItem), { merge: true });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `ragDocuments/${docItem.id}`);
    } catch (e) {
      // Swallowed thrown error to prevent app crash but it was logged properly
    }
  }
}

export async function getUserRagDocuments(userId: string): Promise<RagDocument[]> {
  try {
    const docsRef = collection(db, 'ragDocuments');
    const q = query(docsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as RagDocument);
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'ragDocuments');
    } catch (e) {
      // Swallowed thrown error to prevent app crash but it was logged properly
    }
    const local = getLocalRagDocs().filter(d => d.userId === userId);
    return local.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function deleteRagDocument(docId: string): Promise<void> {
  // Always update local cache first
  const local = getLocalRagDocs().filter(d => d.id !== docId);
  saveLocalRagDocs(local);

  try {
    await deleteDoc(doc(db, 'ragDocuments', docId));
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, `ragDocuments/${docId}`);
    } catch (e) {
      // Swallowed thrown error to prevent app crash but it was logged properly
    }
  }
}
