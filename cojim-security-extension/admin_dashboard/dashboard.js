import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🛡️ Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};
import {
  doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const configDoc = doc(db, "remoteConfig", "default");

async function syncAIModerationToggle() {
  const docSnap = await getDoc(configDoc);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const toggle = document.getElementById("aiModerationToggle");
    if (toggle) toggle.checked = !!data.aiModerationEnabled;

    toggle.addEventListener("change", async () => {
      await updateDoc(configDoc, { aiModerationEnabled: toggle.checked });
    });
  }
}
syncAIModerationToggle();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔧 UTILITY – Render list items like adminEmails, whitelist, blacklist, etc.
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

// ✨ Add to Firestore remoteConfig doc (auto merges into array fields)
window.addField = async function (key) {
  const inputId = "new" + key.charAt(0).toUpperCase() + key.slice(1);
  const input = document.getElementById(inputId);
  const value = input?.value.trim();
  if (!value) return;

  const configRef = doc(db, "remoteConfig", "global");

  try {
    const configSnap = await getDocs(collection(db, "remoteConfig"));
    let current = [];
    configSnap.forEach(doc => {
      if (doc.id === "global" && doc.data()[key]) {
        current = doc.data()[key];
      }
    });

    if (!current.includes(value)) {
      current.push(value);
      await updateDoc(configRef, { [key]: current });
      console.log(`✅ Added "${value}" to ${key}`);
    }

    input.value = "";
  } catch (e) {
    console.error(`❌ Failed to update ${key}:`, e);
  }
};

// ⚠️ Not yet implemented (will replace with array update logic)
window.removeField = function (key, index) {
  alert("Remove functionality will be added in v3.3.");
};

// 🔴 Real-time Flagged Logs
const logsContainer = document.getElementById("logs-container");

function renderLogEntry(data) {
  const card = document.createElement("div");
  card.className = "border p-3 mb-4 rounded bg-white shadow";

  const riskColor = data.riskLevel === 'high'
    ? 'bg-red-600'
    : data.riskLevel === 'medium'
    ? 'bg-yellow-400'
    : 'bg-green-600';

  const badge = `<span class="text-white text-xs px-2 py-1 rounded ${riskColor} font-semibold">${data.riskLevel?.toUpperCase() || 'UNKNOWN'}</span>`;

  card.innerHTML = `
    <p><strong>Platform:</strong> ${data.platform || 'Unknown'} ${badge}</p>
    <p><strong>Original:</strong> ${data.text}</p>
    <p><strong>Translated:</strong> ${data.translatedText || '[n/a]'}</p>
    <p><strong>Sentiment:</strong> ${data.sentiment || 'neutral'}</p>
    <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
  `;

  logsContainer.appendChild(card);
}

// 🔁 Start listening to logs
function startLogsListener() {
  logsContainer.innerHTML = '<p class="text-gray-500">Listening for flagged content...</p>';
  const q = query(collection(db, "flaggedLogs"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    logsContainer.innerHTML = '';
    snapshot.forEach(doc => renderLogEntry(doc.data()));
  });
}

startLogsListener();
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById("exportCsvBtn")?.addEventListener("click", async () => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "flaggedLogs"));

  const rows = [];
  rows.push([
    "Original Text",
    "Translated Text",
    "Sentiment",
    "Platform",
    "Timestamp",
    "High Risk"
  ]);

  snapshot.forEach(doc => {
    const data = doc.data();
    rows.push([
      `"${data.text || ""}"`,
      `"${data.translatedText || ""}"`,
      data.sentiment || "",
      data.platform || "",
      new Date(data.timestamp).toLocaleString(),
      data.highRisk ? "YES" : "NO"
    ]);
  });

  const csvContent = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `flagged-logs-${Date.now()}.csv`;
  link.click();
});
