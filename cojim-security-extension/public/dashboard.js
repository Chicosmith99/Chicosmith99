// 🌒 Dark Mode Toggle & Persistence
const html = document.documentElement;
const darkToggle = document.getElementById("darkModeToggle");

// Load preference
if (localStorage.getItem("theme") === "dark") {
  html.classList.add("dark");
  if (darkToggle) darkToggle.checked = true;
}

// Save preference
darkToggle?.addEventListener("change", () => {
  const enableDark = darkToggle.checked;
  html.classList.toggle("dark", enableDark);
  localStorage.setItem("theme", enableDark ? "dark" : "light");
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const logsContainer = document.getElementById("logs-container");
const searchInput = document.getElementById("logSearch");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const exportBtn = document.getElementById("exportCsvBtn");

let allLogs = [];

// Render single log entry
function renderLogEntry(data) {
  const card = document.createElement("div");
  card.className = "bg-gray-100 dark:bg-gray-800 p-3 rounded border shadow";

  const riskColor = data.highRisk
    ? "text-red-600"
    : data.sentiment === "negative"
    ? "text-yellow-500"
    : "text-green-600";

  card.innerHTML = `
    <p><strong>Platform:</strong> ${data.platform || "Unknown"}</p>
    <p><strong>Text:</strong> ${data.text}</p>
    <p><strong>Translated:</strong> ${data.translatedText || "[n/a]"}</p>
    <p><strong>Sentiment:</strong> <span class="${riskColor} font-semibold">${
    data.sentiment || "neutral"
  }</span></p>
    <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
  `;
  return card;
}

// Apply filters to logs and render
function renderFilteredLogs() {
  logsContainer.innerHTML = "";
  const searchTerm = searchInput.value.toLowerCase();
  const startTimestamp = startDateInput.value
    ? new Date(startDateInput.value).setHours(0, 0, 0, 0)
    : null;
  const endTimestamp = endDateInput.value
    ? new Date(endDateInput.value).setHours(23, 59, 59, 999)
    : null;

  const filtered = allLogs.filter((log) => {
    const text = (log.text || "").toLowerCase();
    const translated = (log.translatedText || "").toLowerCase();
    const timestamp = log.timestamp;

    // Search term filter (search both original and translated)
    if (
      searchTerm &&
      !text.includes(searchTerm) &&
      !translated.includes(searchTerm)
    ) {
      return false;
    }

    // Date range filter
    if (
      (startTimestamp && timestamp < startTimestamp) ||
      (endTimestamp && timestamp > endTimestamp)
    ) {
      return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    logsContainer.innerHTML = `<p class="text-gray-500 dark:text-gray-300">No logs match the filter criteria.</p>`;
  } else {
    filtered.forEach((log) => logsContainer.appendChild(renderLogEntry(log)));
  }
}

// Listen for Firestore changes and update local cache & render
function startLogsListener() {
  const q = query(collection(db, "flaggedLogs"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    allLogs = [];
    snapshot.forEach((doc) => {
      allLogs.push(doc.data());
    });
    renderFilteredLogs();
  });
}
startLogsListener();

// React to filter input changes
searchInput.addEventListener("input", renderFilteredLogs);
startDateInput.addEventListener("change", renderFilteredLogs);
endDateInput.addEventListener("change", renderFilteredLogs);

// CSV export with filters applied
exportBtn?.addEventListener("click", () => {
  if (allLogs.length === 0) {
    alert("No logs available to export.");
    return;
  }

  const rows = [
    ["Text", "Translated", "Sentiment", "Platform", "Timestamp", "High Risk"],
  ];

  const searchTerm = searchInput.value.toLowerCase();
  const startTimestamp = startDateInput.value
    ? new Date(startDateInput.value).setHours(0, 0, 0, 0)
    : null;
  const endTimestamp = endDateInput.value
    ? new Date(endDateInput.value).setHours(23, 59, 59, 999)
    : null;

  const filtered = allLogs.filter((log) => {
    const text = (log.text || "").toLowerCase();
    const translated = (log.translatedText || "").toLowerCase();
    const timestamp = log.timestamp;

    if (
      searchTerm &&
      !text.includes(searchTerm) &&
      !translated.includes(searchTerm)
    ) {
      return false;
    }

    if (
      (startTimestamp && timestamp < startTimestamp) ||
      (endTimestamp && timestamp > endTimestamp)
    ) {
      return false;
    }

    return true;
  });

  filtered.forEach((d) => {
    rows.push([
      `"${d.text || ""}"`,
      `"${d.translatedText || ""}"`,
      d.sentiment || "neutral",
      d.platform || "Unknown",
      new Date(d.timestamp).toLocaleString(),
      d.highRisk ? "YES" : "NO",
    ]);
  });

  if (filtered.length === 0) {
    alert("No logs match the filter criteria for export.");
    return;
  }

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flagged-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});
