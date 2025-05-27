import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Approved emails
const approved = ["chicoajsmith@gmail.com", "christopherorjiministries@gmail.com"];

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!approved.includes(result.user.email)) {
      throw new Error("Access denied. Unauthorized email.");
    }
    // Redirect if approved
    window.location.href = "/admin.html";
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove("hidden");
  }
});
