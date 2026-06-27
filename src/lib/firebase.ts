import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { ChatSession, ChatMessage, RagDocument } from '../types';

const firebaseConfig = {
  projectId: "gen-lang-client-0015111536",
  appId: "1:64524243579:web:6572a09e99b56fa926c8de",
  apiKey: "AIzaSyCRFXPfN1YxiXKytz-rzkD0Webq9dhpRe4",
  authDomain: "gen-lang-client-0015111536.firebaseapp.com",
  storageBucket: "gen-lang-client-0015111536.firebasestorage.app",
  messagingSenderId: "64524243579"
};

const databaseId = "ai-studio-eburonbelgiumdat-d057b707-c3dd-46e9-ad32-98f00a101b34";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };

// Firestore Helper Functions
export async function saveChatSession(session: ChatSession): Promise<void> {
  try {
    const sessionRef = doc(db, 'chatSessions', session.id);
    await setDoc(sessionRef, session, { merge: true });
  } catch (err) {
    console.error('Error saving session to Firestore:', err);
  }
}

export async function getUserSessions(userId: string): Promise<ChatSession[]> {
  try {
    const sessionsRef = collection(db, 'chatSessions');
    const q = query(sessionsRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ChatSession);
  } catch (err) {
    console.error('Error fetching user sessions:', err);
    return [];
  }
}

export async function saveChatMessage(message: ChatMessage, sessionId: string, userId: string): Promise<void> {
  try {
    const msgRef = doc(db, 'chatMessages', message.id);
    await setDoc(msgRef, {
      ...message,
      sessionId,
      userId
    }, { merge: true });
  } catch (err) {
    console.error('Error saving chat message:', err);
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
        imageUrl: data.imageUrl,
        imageAnalysis: data.imageAnalysis,
        isThinking: data.isThinking,
        createdAt: data.createdAt
      } as ChatMessage;
    });
  } catch (err) {
    console.error('Error fetching session messages:', err);
    return [];
  }
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'chatSessions', sessionId));
  } catch (err) {
    console.error('Error deleting chat session:', err);
  }
}

export async function saveRagDocument(docItem: RagDocument): Promise<void> {
  try {
    const docRef = doc(db, 'ragDocuments', docItem.id);
    await setDoc(docRef, docItem, { merge: true });
  } catch (err) {
    console.error('Error saving RAG doc to Firestore:', err);
  }
}

export async function getUserRagDocuments(userId: string): Promise<RagDocument[]> {
  try {
    const docsRef = collection(db, 'ragDocuments');
    const q = query(docsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as RagDocument);
  } catch (err) {
    console.error('Error fetching RAG docs:', err);
    return [];
  }
}

export async function deleteRagDocument(docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'ragDocuments', docId));
  } catch (err) {
    console.error('Error deleting RAG doc:', err);
  }
}
