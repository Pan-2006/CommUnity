// auth.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* ==================== REGISTER ==================== */
export async function registerUser(email, password, extraData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extra info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      ...extraData,
      createdAt: new Date()
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, code: error.code, message: error.message };
  }
}

/* ==================== LOGIN ==================== */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, code: error.code, message: error.message };
  }
}

/* ==================== FORGOT PASSWORD ==================== */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, code: error.code, message: error.message };
  }
}

/* ==================== LOGOUT ==================== */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, code: error.code, message: error.message };
  }
}

// Optional: expose auth helpers if used inline in HTML
window.loginUser = loginUser;
window.registerUser = registerUser;
window.resetPassword = resetPassword;
window.logoutUser = logoutUser;

