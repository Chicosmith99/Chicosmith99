// utils/firebaseClient.js - Firebase client initialization and real-time listeners

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, onValue } from 'firebase/database';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAoJZlmCFN6k9lSyRfzrj-ZCBai9xvOYEw",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e",
  storageBucket: "cojim-social-media-security-e.firebasestorage.app",
  messagingSenderId: "314129321160",
  appId: "1:314129321160:web:9f8441c2874559aaa629fd",
  measurementId: "G-6QTC2B08QZ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Listen for new flagged comments
function listenFlaggedComments(callback) {
  const flaggedRef = ref(database, 'flaggedComments');
  onChildAdded(flaggedRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

// Listen for moderation actions
function listenModerationActions(callback) {
  const moderationRef = ref(database, 'moderationActions');
  onChildAdded(moderationRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

export {
  listenFlaggedComments,
  listenModerationActions,
};
