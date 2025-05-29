// 🌒 Dark Mode Toggle & Persistence
const html = document.documentElement;
const darkToggle = document.getElementById("darkModeToggle");

// Load user preference
if (localStorage.getItem("theme") === "dark") {
  html.classList.add("dark");
  if (darkToggle) darkToggle.checked = true;
}

// Save preference on toggle
darkToggle?.addEventListener("change", () => {
  const enableDark = darkToggle.checked;
  html.classList.toggle("dark", enableDark);
  localStorage.setItem("theme", enableDark ? "dark" : "light");
});

// 📦 Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🧠 Render Log Entry
const logsContainer = document.getElementById("logs-container");

function renderLogEntry(data) {
  const card = document.createElement("div");
  card.className = "bg-gray-100 dark:bg-gray-800 p-3 rounded border shadow";

  const riskColor = data.highRisk
    ? 'text-red-600'
    : data.sentiment === 'negative'
    ? 'text-yellow-500'
    : 'text-green-600';

  card.innerHTML = `
    <p><strong>Platform:</strong> ${data.platform || 'Unknown'}</p>
    <p><strong>Text:</strong> ${data.text}</p>
    <p><strong>Translated:</strong> ${data.translatedText || '[n/a]'}</p>
    <p><strong>Sentiment:</strong> <span class="${riskColor} font-semibold">${data.sentiment || 'neutral'}</span></p>
    <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
  `;
  logsContainer.appendChild(card);
}

// 🔁 Realtime Firestore Listener
function startLogsListener() {
  const q = query(collection(db, "flaggedLogs"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    logsContainer.innerHTML = '';
    snapshot.forEach(doc => renderLogEntry(doc.data()));
  });
}
startLogsListener();

// 📤 CSV Export Logic
document.getElementById("exportCsvBtn")?.addEventListener("click", async () => {
  const snapshot = await getDocs(collection(db, "flaggedLogs"));
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

  const csvContent = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flagged-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});
