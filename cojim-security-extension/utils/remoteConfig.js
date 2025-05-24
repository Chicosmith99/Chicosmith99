import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAoJZlmCFN6k9lSyRfzrj-ZCBai9xvOYEw",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e",
  storageBucket: "cojim-social-media-security-e.firebasestorage.app",
  messagingSenderId: "314129321160",
  appId: "1:314129321160:web:9f8441c2874559aaa629fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function fetchRemoteConfig() {
  try {
    const configRef = doc(db, 'securityConfig', 'global');
    const snapshot = await getDoc(configRef);
    if (!snapshot.exists()) throw new Error('Config not found.');
    return snapshot.data();
  } catch (err) {
    console.error('Failed to fetch remote config:', err.message);
    return {};
  }
}
