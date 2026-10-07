import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate Connection to Firestore as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection notice: client appears offline.', error);
    }
  }
}
testConnection();

// Sign in with Google
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

// Sign out from Firebase
export async function signOutFirebase() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.warn('Firebase Sign-out error:', error);
  }
}

// Firestore Persistence helpers (enforcing authenticated Firebase user matching firestore.rules)
export async function syncUserToFirestore(userData: {
  email: string;
  full_name: string;
  phone_number?: string;
  balance?: number;
  is_activated?: boolean;
}) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    // Client is not authenticated with Firebase Auth (e.g. traditional email/password login).
    // Do not attempt Firestore write to avoid permission errors.
    return;
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(
      userRef,
      {
        ...userData,
        firebase_uid: currentUser.uid,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.warn('Notice: Firestore user sync was not completed:', err?.message || err);
  }
}

export async function saveGeminiChatToFirestore(threadData: {
  id?: string;
  title: string;
  role_type: string;
  model: string;
  grounding_enabled: boolean;
  messages: any[];
}) {
  const currentUser = auth.currentUser;
  const threadId = threadData.id || `chat_${Date.now()}`;

  if (!currentUser) {
    // Persist locally for non-Firebase authenticated sessions
    try {
      const localKey = 'gemini_threads_local';
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      const filtered = existing.filter((t: any) => t.id !== threadId);
      filtered.unshift({
        ...threadData,
        id: threadId,
        updated_at: new Date().toISOString(),
      });
      localStorage.setItem(localKey, JSON.stringify(filtered.slice(0, 30)));
    } catch {
      // Ignore local storage error
    }
    return threadId;
  }

  try {
    const chatRef = doc(db, 'users', currentUser.uid, 'gemini_chats', threadId);
    await setDoc(
      chatRef,
      {
        ...threadData,
        id: threadId,
        user_id: currentUser.uid,
        messages: JSON.stringify(threadData.messages),
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
    return threadId;
  } catch (err: any) {
    console.warn('Notice: Could not save Gemini chat to Firestore:', err?.message || err);
    return null;
  }
}

export async function loadGeminiChatsFromFirestore() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    try {
      return JSON.parse(localStorage.getItem('gemini_threads_local') || '[]');
    } catch {
      return [];
    }
  }

  try {
    const chatsRef = collection(db, 'users', currentUser.uid, 'gemini_chats');
    const snapshot = await getDocs(chatsRef);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        messages: typeof data.messages === 'string' ? JSON.parse(data.messages) : data.messages,
      };
    });
  } catch (err: any) {
    console.warn('Notice: Could not load Gemini chats from Firestore:', err?.message || err);
    return [];
  }
}

export { app };
