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

// 🔐 Toggle Password Visibility
document.getElementById("togglePassword").addEventListener("click", () => {
  const pwInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePassword");
  const isHidden = pwInput.getAttribute("type") === "password";

  pwInput.setAttribute("type", isHidden ? "text" : "password");
  toggleBtn.textContent = isHidden ? "Hide" : "Show";
});
