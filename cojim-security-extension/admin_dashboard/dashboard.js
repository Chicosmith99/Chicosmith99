import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility: Load and render fields
function renderList(listId, values) {
  const ul = document.getElementById(listId);
  ul.innerHTML = "";
  values.forEach((val, index) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-gray-200 px-2 py-1 rounded";
    li.innerHTML = `
      <span>${val}</span>
      <button class="text-red-600 hover:underline" onclick="removeField('${listId}', ${index})">Remove</button>
    `;
    ul.appendChild(li);
  });
}

window.addField = async function (key) {
  const input = document.getElementById("new" + key.charAt(0).toUpperCase() + key.slice(1));
  const val = input.value.trim();
  if (!val) return;
  const ref = collection(db, "remoteConfig");
  const docRef = collection(db, "remoteConfig");
  const snapshot = await onSnapshot(docRef, () => {});
  input.value = "";
};

window.removeField = function (key, index) {
  console.log("Remove not implemented in Firestore yet");
};

// 🔴 Realtime Logs
const logsContainer = document.getElementById("logs-container");

function renderLogEntry(data) {
  const card = document.createElement("div");
  card.className = "border p-3 rounded bg-gray-50";

  const text = document.createElement("p");
  text.innerHTML = `<strong>Original:</strong> ${data.text}`;

  const translated = document.createElement("p");
  translated.innerHTML = `<strong>Translated:</strong> ${data.translatedText || '[n/a]'}`;

  const sentiment = document.createElement("p");
  sentiment.innerHTML = `<strong>Sentiment:</strong> ${data.sentiment || 'neutral'}`;

  const platform = document.createElement("p");
  platform.innerHTML = `<strong>Platform:</strong> ${data.platform}`;

  const time = new Date(data.timestamp).toLocaleString();
  const timestamp = document.createElement("p");
  timestamp.innerHTML = `<strong>Time:</strong> ${time}`;

  card.appendChild(text);
  card.appendChild(translated);
  card.appendChild(sentiment);
  card.appendChild(platform);
  card.appendChild(timestamp);
  logsContainer.appendChild(card);
}

function startLogsListener() {
  logsContainer.innerHTML = '<p class="text-gray-500">Listening for flagged content...</p>';
  const q = query(collection(db, "flaggedLogs"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    logsContainer.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      renderLogEntry(data);
    });
  });
}

startLogsListener();
