import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔐 Firebase Setup
const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔐 AUTH CHECK
onAuthStateChanged(auth, async user => {
  if (!user) {
    console.log("🔐 Not signed in, triggering popup...");
    await signInWithPopup(auth, provider);
  } else {
    const email = user.email;
    const ref = doc(db, "remoteConfig", "global");
    const snap = await getDoc(ref);
    const admins = snap.exists() ? snap.data().adminEmails || [] : [];

    if (!admins.includes(email)) {
      alert("⛔ Access Denied: You're not an authorized admin.");
      document.body.innerHTML = "<h2 class='text-red-600 text-xl p-4'>🚫 Unauthorized</h2>";
    } else {
      console.log("✅ Admin Authenticated:", email);
      syncAIModerationToggle();
      startLogsListener();
      loadRemoteRuleViewer();
    }
  }
});

// 🔁 AI Moderation Toggle
async function syncAIModerationToggle() {
  const ref = doc(db, "remoteConfig", "global");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const toggle = document.getElementById("aiModerationToggle");
    const current = snap.data().aiModerationEnabled || false;
    if (toggle) {
      toggle.checked = current;
      toggle.addEventListener("change", async () => {
        await updateDoc(ref, { aiModerationEnabled: toggle.checked });
        console.log(`🤖 AI Moderation toggled: ${toggle.checked}`);
      });
    }
  }
}

// 🔧 Add Field
window.addField = async function (key) {
  const input = document.getElementById("new" + key.charAt(0).toUpperCase() + key.slice(1));
  const value = input?.value.trim();
  if (!value) return;

  const ref = doc(db, "remoteConfig", "global");
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data()[key] || [] : [];

  if (!existing.includes(value)) {
    existing.push(value);
    await updateDoc(ref, { [key]: existing });
    console.log(`✅ Added to ${key}:`, value);
  }

  input.value = "";
};

// 🧨 Removal not implemented
window.removeField = function () {
  alert("⚠️ Remove not implemented yet.");
};

// 📡 Live Logs
const logsContainer = document.getElementById("logs-container");

function renderLogEntry(data) {
  const card = document.createElement("div");
  card.className = "border p-3 mb-3 bg-white rounded shadow";

  const badge = data.highRisk
    ? "bg-red-600"
    : data.sentiment === "negative"
    ? "bg-yellow-500"
    : "bg-green-600";

  card.innerHTML = `
    <p><strong>Platform:</strong> ${data.platform || "Unknown"} <span class="text-white text-xs px-2 py-1 rounded ${badge}">${data.sentiment || "neutral"}</span></p>
    <p><strong>Original:</strong> ${data.text}</p>
    <p><strong>Translated:</strong> ${data.translatedText || "[n/a]"}</p>
    <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
  `;
  logsContainer.appendChild(card);
}

function startLogsListener() {
  logsContainer.innerHTML = '<p class="text-gray-500">Listening for logs...</p>';
  const q = query(collection(db, "flaggedLogs"), orderBy("timestamp", "desc"));
  onSnapshot(q, snap => {
    logsContainer.innerHTML = "";
    snap.forEach(doc => renderLogEntry(doc.data()));
  });
}

// 📤 Export to CSV
document.getElementById("exportCSV")?.addEventListener("click", async () => {
  const q = query(collection(db, "flaggedLogs"), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  if (snap.empty) {
    alert("No logs found.");
    return;
  }

  const rows = [["Text", "Translated", "Sentiment", "Platform", "Timestamp", "High Risk"]];
  snap.forEach(doc => {
    const d = doc.data();
    rows.push([
      `"${d.text || ""}"`,
      `"${d.translatedText || ""}"`,
      d.sentiment || "",
      d.platform || "",
      new Date(d.timestamp).toLocaleString(),
      d.highRisk ? "YES" : "NO"
    ]);
  });

  const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flagged-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// 📬 Weekly Digest Preview
document.getElementById("previewDigestBtn")?.addEventListener("click", async () => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const q = query(collection(db, "flaggedLogs"), where("timestamp", ">=", oneWeekAgo));
  const snap = await getDocs(q);
  const logs = [];
  snap.forEach(doc => logs.push(doc.data()));

  const formatted = logs.length === 0
    ? "No flagged content found in the last 7 days."
    : logs.map(log => {
        return `📌 ${log.platform} | ${new Date(log.timestamp).toLocaleString()}
- Text: ${log.text}
- Translated: ${log.translatedText}
- Sentiment: ${log.sentiment}
- High Risk: ${log.highRisk ? "Yes" : "No"}`;
      }).join("\n\n");

  document.getElementById("digestContent").textContent = formatted;
  document.getElementById("digestPreview").classList.remove("hidden");
});

// 📧 "Send" Digest Button (Simulated)
document.getElementById("sendDigestBtn")?.addEventListener("click", () => {
  const content = document.getElementById("digestContent").textContent;
  const recipients = ["info@cojim.org", "christopherorjiministries@gmail.com"];
  console.log("📧 Sending digest to:", recipients);
  console.log(content);
  alert("✅ Digest sent! (Simulated)");
});

// 🔍 Remote Config Viewer
async function loadRemoteRuleViewer() {
  const ref = doc(db, "remoteConfig", "global");
  const snap = await getDoc(ref);
  const panel = document.getElementById("remoteRulesPanel");

  if (!snap.exists()) {
    panel.innerHTML = "<p class='text-red-600'>⚠️ No remote config found.</p>";
    return;
  }

  const data = snap.data();
  panel.innerHTML = Object.entries(data).map(([k, v]) => {
    const val = Array.isArray(v) ? v.join(", ") : JSON.stringify(v);
    return `<p><strong>${k}:</strong> ${val}</p>`;
  }).join("");
}
