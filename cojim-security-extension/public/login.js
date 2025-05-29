import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Whitelisted admin emails
const allowedEmails = ["chicoajsmith@gmail.com", "christopherorjiministries@gmail.com"];

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error");

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
    errorEl.textContent = err.message;
    errorEl.classList.remove("hidden");
  }
});

document.getElementById("togglePassword").addEventListener("click", () => {
  const pwInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");

  const isHidden = pwInput.getAttribute("type") === "password";
  pwInput.setAttribute("type", isHidden ? "text" : "password");

  // Swap eye icons
  eyeIcon.innerHTML = isHidden
    ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
             d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.969 9.969 0 012.182-3.568M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />`
    : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
             d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
             d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
});
