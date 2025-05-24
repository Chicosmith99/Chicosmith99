import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const allowedAdmin = "chicoajsmith@gmail.com";
let configDoc;

function createListItem(field, value) {
  const li = document.createElement('li');
  li.className = "flex items-center gap-2";
  const span = document.createElement('span');
  span.textContent = value;
  const btn = document.createElement('button');
  btn.textContent = "❌";
  btn.className = "text-red-600";
  btn.onclick = () => removeField(field, value);
  li.appendChild(span);
  li.appendChild(btn);
  document.getElementById(field).appendChild(li);
}

async function loadData() {
  configDoc = doc(db, "securityConfig", "global");
  const snap = await getDoc(configDoc);
  const data = snap.data();
  ['adminEmails', 'whitelist', 'blacklist', 'customSpamPatterns'].forEach(field => {
    document.getElementById(field).innerHTML = '';
    (data[field] || []).forEach(v => createListItem(field, v));
  });
}

async function addField(field) {
  const input = document.getElementById("new" + field.charAt(0).toUpperCase() + field.slice(1));
  const val = input.value.trim();
  if (!val) return;
  const snap = await getDoc(configDoc);
  const current = snap.data()[field] || [];
  if (!current.includes(val)) {
    current.push(val);
    await updateDoc(configDoc, { [field]: current });
    input.value = "";
    loadData();
  }
}

async function removeField(field, val) {
  const snap = await getDoc(configDoc);
  const current = snap.data()[field] || [];
  const updated = current.filter(v => v !== val);
  await updateDoc(configDoc, { [field]: updated });
  loadData();
}

// Auth check
onAuthStateChanged(auth, (user) => {
  if (user?.email === allowedAdmin) {
    loadData();
  } else {
    alert("Access denied. You are not an authorized admin.");
    signInWithPopup(auth, provider);
  }
});
