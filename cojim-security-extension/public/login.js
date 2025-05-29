import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const allowedEmails = ["chicoajsmith@gmail.com", "christopherorjiministries@gmail.com"];

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error");

  errorEl.classList.add("hidden");
  errorEl.textContent = "";

  if (!email || !password) {
    errorEl.textContent = "Please enter both email and password.";
    errorEl.classList.remove("hidden");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const userEmail = userCred.user.email;

    if (allowedEmails.includes(userEmail)) {
      window.location.href = "admin.html";
    } else {
      errorEl.textContent = "Access denied: Not an authorized admin.";
      errorEl.classList.remove("hidden");
    }
  } catch (err) {
    errorEl.textContent = err.message.replace("Firebase:", "").trim();
    errorEl.classList.remove("hidden");
  }
});

// 👁️ Password visibility toggle
const toggleBtn = document.getElementById("togglePassword");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const passwordInput = document.getElementById("password");
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.innerHTML = isHidden
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.5 0-8.343-2.943-9.6-7a10.05 10.05 0 011.707-2.99M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
             d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
             d="M2.458 12C3.732 7.943 7.5 5 12 5c4.5 0 8.343 2.943 9.6 7-1.257 4.057-5.1 7-9.6 7-4.5 0-8.343-2.943-9.6-7z" />
         </svg>`;
  });
}
