// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoUPl8C0ZXl8VDj8OsMgM1Ipwbb2vbJdc",
  authDomain: "community-carpool-b7c9b.firebaseapp.com",
  projectId: "community-carpool-b7c9b",
  storageBucket: "community-carpool-b7c9b.firebasestorage.app",
  messagingSenderId: "669101428121",
  appId: "1:669101428121:web:66f402d3836d32526c1708",
  measurementId: "G-ZWNCQJE270"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Analytics (guarded for environments where analytics may not be available)
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (err) {
  // Analytics may fail in some environments (e.g., file:// or restricted contexts)
  // Fail silently — analytics is optional for app functionality
  analytics = null;
}

// Expose Auth and Firestore as named exports for use in other modules
export const auth = getAuth(app);
export const db = getFirestore(app);

// Default export (optional)
export default app;
