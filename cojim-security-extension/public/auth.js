// auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔐 Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Allowed admin emails
const ALLOWED_ADMINS = [
  "chicoajsmith@gmail.com",
  "christopherorjiministries@gmail.com"
];

// 🔓 Login button click handler
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const errorMsg = document.getElementById("errorMsg");
  errorMsg.classList.add("hidden");

  if (!email || !password) {
    errorMsg.textContent = "Please enter both email and password.";
    errorMsg.classList.remove("hidden");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    if (!ALLOWED_ADMINS.includes(user.email)) {
      errorMsg.textContent = "❌ Access denied. You're not an authorized admin.";
      errorMsg.classList.remove("hidden");
      return;
    }

    // ✅ Success: redirect to dashboard
    window.location.href = "/index.html";
  } catch (err) {
    console.error("Login error:", err);
    errorMsg.textContent = "Authentication failed. Check your credentials.";
    errorMsg.classList.remove("hidden");
  }
});
