import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
auth.onAuthStateChanged(async user => {
  if (user) {
    const userEmail = user.email;
    console.log("✅ Signed in as:", userEmail);

    // Fetch authorized admin list from Firestore
    const docRef = doc(getFirestore(app), "remoteConfig", "global");
    const docSnap = await getDoc(docRef);
    const admins = docSnap.data().adminEmails || [];

    if (!admins.includes(userEmail)) {
      alert("Access denied. You are not an authorized admin.");
      document.body.innerHTML = '<h2 class="text-red-600 text-xl p-4">🚫 Unauthorized</h2>';
    } else {
      console.log("🔓 Access granted to admin dashboard.");
      // Proceed with rest of logic
      startLogsListener(); // if you have a function to start Firestore listeners
    }

  } else {
    // If not logged in, trigger sign-in popup
    console.log("🔐 Not signed in. Prompting...");
    await signInWithPopup(auth, provider);
  }
});

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📦 Utility: Render List
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

// 🔧 Add Field to remoteConfig
window.addField = async function (key) {
  const inputId = "new" + key.charAt(0).toUpperCase() + key.slice(1);
  const input = document.getElementById(inputId);
  const value = input?.value.trim();
  if (!value) return;

  const configRef = doc(db, "remoteConfig", "global");

  const docSnap = await getDoc(configRef);
  let current = [];
  if (docSnap.exists()) {
    current = docSnap.data()[key] || [];
  }

  if (!current.includes(value)) {
    current.push(value);
    await updateDoc(configRef, { [key]: current });
    console.log(`✅ Added "${value}" to ${key}`);
  }

  input.value = "";
};

// 🧨 Not yet implemented removal
window.removeField = function (key, index) {
  alert("⚠️ Removal feature will be added in v3.3.");
};

// 🧠 AI Moderation Toggle Sync
async function syncAIModerationToggle() {
  const configRef = doc(db, "remoteConfig", "global");
  const snap = await getDoc(configRef);
  if (snap.exists()) {
    const data = snap.data();
    const toggle = document.getElementById("aiModerationToggle");
    if (toggle) {
      toggle.checked = !!data.aiModerationEnabled;
      toggle.addEventListener("change", async () => {
        await updateDoc(configRef, { aiModerationEnabled: toggle.checked });
        console.log(`🔁 AI Moderation updated: ${toggle.checked}`);
      });
    }
  }
}
syncAIModerationToggle();

// 🔴 Real-time Flagged Logs
const logsContainer = document.getElementById("logs-container");

function renderLogEntry(data) {
  const card = document.createElement("div");
  card.className = "border p-3 mb-4 rounded bg-white shadow";

  const riskColor = data.highRisk
    ? 'bg-red-600'
    : data.sentiment === 'negative'
    ? 'bg-yellow-500'
    : 'bg-green-600';

  const badge = `<span class="text-white text-xs px-2 py-1 rounded ${riskColor} font-semibold">${data.sentiment?.toUpperCase() || 'UNKNOWN'}</span>`;

  card.innerHTML = `
    <p><strong>Platform:</strong> ${data.platform || 'Unknown'} ${badge}</p>
    <p><strong>Original:</strong> ${data.text}</p>
    <p><strong>Translated:</strong> ${data.translatedText || '[n/a]'}</p>
    <p><strong>Sentiment:</strong> ${data.sentiment || 'neutral'}</p>
    <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
  `;

  logsContainer.appendChild(card);
}

function startLogsListener() {
  logsContainer.innerHTML = '<p class="text-gray-500">⏳ Listening for flagged content...</p>';
  const q = query(collection(db, "flaggedLogs"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    logsContainer.innerHTML = '';
    snapshot.forEach(doc => renderLogEntry(doc.data()));
  });
}

startLogsListener();

// 📤 CSV Export Button
document.getElementById("exportCsvBtn")?.addEventListener("click", async () => {
  const snapshot = await getDocs(collection(db, "flaggedLogs"));
  if (snapshot.empty) {
    alert("No flagged logs to export.");
    return;
  }

  const rows = [["Text", "Translated", "Sentiment", "Platform", "Timestamp", "High Risk"]];
  snapshot.forEach(doc => {
    const d = doc.data();
    rows.push([
      `"${d.text || ""}"`,
      `"${d.translatedText || ""}"`,
      d.sentiment || "neutral",
      d.platform || "Unknown",
      new Date(d.timestamp).toLocaleString(),
      d.highRisk ? "YES" : "NO"
    ]);
  });

  const csvContent = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flagged-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// 📅 Weekly Digest Preview
document.getElementById("previewDigestBtn")?.addEventListener("click", async () => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const q = query(collection(db, "flaggedLogs"), where("timestamp", ">=", oneWeekAgo));
  const snapshot = await getDocs(q);

  const logs = [];
  snapshot.forEach(doc => logs.push(doc.data()));

  const content = logs.length === 0
    ? "No flagged content found in the last 7 days."
    : logs.map(log => {
        return `📌 ${log.platform} | ${new Date(log.timestamp).toLocaleString()}
- Text: ${log.text}
- Translated: ${log.translatedText}
- Sentiment: ${log.sentiment}
- High Risk: ${log.highRisk ? 'Yes' : 'No'}`;
      }).join("\n\n");

  document.getElementById("digestContent").textContent = content;
  document.getElementById("digestPreview").classList.remove("hidden");
});

// 📧 Send Digest Button
document.getElementById("sendDigestBtn")?.addEventListener("click", () => {
  const digest = document.getElementById("digestContent").textContent;
  const recipients = ["info@cojim.org", "christopherorjiministries@gmail.com"];
  console.log("📧 Would send weekly digest to:", recipients.join(", "));
  console.log("📄 Content:\n" + digest);
  alert("✅ Digest sent! (Simulated – actual email sending requires backend)");
});
async function loadRemoteRuleViewer() {
  const docRef = doc(db, "remoteConfig", "global");
  const docSnap = await getDoc(docRef);
  const panel = document.getElementById("remoteRulesPanel");

  if (!docSnap.exists()) {
    panel.innerHTML = "<p class='text-red-500'>No remote config found.</p>";
    return;
  }

  const data = docSnap.data();
  const formatted = Object.entries(data).map(([key, value]) => {
    const val = Array.isArray(value) ? value.join(", ") : JSON.stringify(value);
    return `<p><strong>${key}:</strong> ${val}</p>`;
  }).join("");

  panel.innerHTML = formatted;
}
loadRemoteRuleViewer();
