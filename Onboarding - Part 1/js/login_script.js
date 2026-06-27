"use strict";

import { registerUser, loginUser, resetPassword } from "../js/auth.js";

const userData = {
  email: "",
  password: "",
  name: "",
  course: "",
  barangay: "",
  role: ""
};

const App = {
  goTo(screenId, context) {
    const currentScreen = document.querySelector(".screen.active");
    const nextScreen = document.getElementById(screenId);

    if (!nextScreen || currentScreen === nextScreen) {
      return;
    }

    if (currentScreen) {
      currentScreen.classList.remove("active");
    }

    nextScreen.classList.add("active");

    if (screenId === "screen-auth" && context) {
      App.switchTab(context);
    }

    if (screenId === "screen-dashboard") {
      App.populateDashboard();
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  },

  /* ── Tab switcher (Login / Sign Up) ── */
  switchTab(tab) {
    const loginForm = document.getElementById("form-login");
    const signupForm = document.getElementById("form-signup");
    const loginTab = document.getElementById("tab-login");
    const signupTab = document.getElementById("tab-signup");
    const tabSlider = document.getElementById("tab-slider");

    if (
      !loginForm ||
      !signupForm ||
      !loginTab ||
      !signupTab ||
      !tabSlider
    ) {
      return;
    }

    const isLogin = tab === "login";

    loginForm.classList.toggle("hidden", !isLogin);
    signupForm.classList.toggle("hidden", isLogin);

    loginTab.classList.toggle("active", isLogin);
    signupTab.classList.toggle("active", !isLogin);

    loginTab.setAttribute(
      "aria-selected",
      isLogin ? "true" : "false"
    );

    signupTab.setAttribute(
      "aria-selected",
      isLogin ? "false" : "true"
    );

    const selectedTab = isLogin ? loginTab : signupTab;

    tabSlider.style.width = `${selectedTab.offsetWidth}px`;
    tabSlider.style.left = `${selectedTab.offsetLeft}px`;
  },

  /* ── UI helpers ───────────────────── */
  clearErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.querySelectorAll('.field-error').forEach((el) => {
      el.textContent = '';
    });

    form.querySelectorAll('.field-input, .field-input:focus-visible').forEach((input) => {
      input.classList.remove('input-error');
    });
  },

  showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
  },

  isSchoolEmail(email) {
    return /^[^\s@]+@[^\s@]+\.edu\.ph$/i.test(email);
  },

  setInputError(inputId, hasError) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.toggle('input-error', hasError);
  },

  togglePw(button) {
    if (!button) return;
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    button.classList.toggle('active', isPassword);
    button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  },

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show toast--${type}`;
    window.clearTimeout(this.toastTimeout);
    this.toastTimeout = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  /* ── Password reset handler ────────── */
  async handleResetPassword() {
    App.clearErrors('form-reset');
    const email = document.getElementById('reset-email').value.trim();
    const sendButton = document.getElementById('send-reset-btn');
    if (sendButton) sendButton.disabled = true;

    let valid = true;

    if (!email) {
      App.showError('reset-email-err', 'Email is required.');
      App.setInputError('reset-email', true);
      valid = false;
    } else if (!App.isSchoolEmail(email)) {
      App.showError('reset-email-err', 'Please use your official .edu.ph school email.');
      App.setInputError('reset-email', true);
      valid = false;
    }

    if (!valid) {
      if (sendButton) sendButton.disabled = false;
      return;
    }

    const result = await resetPassword(email);
    if (result.success) {
      App.showToast('Reset link sent. Check your email.');
      const emailDisplay = document.getElementById('reset-email-display');
      const resetMeta = document.getElementById('reset-meta');
      if (emailDisplay) emailDisplay.textContent = email;
      if (resetMeta) {
        resetMeta.classList.remove('hidden');
        resetMeta.classList.add('visible');
      }
      App.startResetTimer();
    } else {
      App.showError('reset-email-err', result.message);
      if (sendButton) sendButton.disabled = false;
    }
  },

  async resendResetPassword() {
    const email = document.getElementById('reset-email').value.trim();
    const resendButton = document.getElementById('resend-reset-btn');
    if (resendButton) resendButton.disabled = true;

    if (!email) {
      App.showError('reset-email-err', 'Please enter your email first.');
      App.setInputError('reset-email', true);
      if (resendButton) resendButton.disabled = false;
      return;
    }

    App.clearErrors('form-reset');
    const result = await resetPassword(email);
    if (result.success) {
      App.showToast('Reset link resent.');
      App.startResetTimer();
    } else {
      App.showError('reset-email-err', result.message);
      if (resendButton) resendButton.disabled = false;
    }
  },

  startResetTimer(duration = 30) {
    const resendButton = document.getElementById('resend-reset-btn');
    const timerDisplay = document.getElementById('reset-timer-display');
    const resetMeta = document.getElementById('reset-meta');

    if (resetMeta) {
      resetMeta.classList.remove('hidden');
      resetMeta.classList.add('visible');
    }
    if (resendButton) resendButton.disabled = true;

    if (this.resetTimerInterval) {
      window.clearInterval(this.resetTimerInterval);
    }

    let remaining = duration;
    if (timerDisplay) timerDisplay.textContent = App.formatTime(remaining);

    this.resetTimerInterval = window.setInterval(() => {
      remaining -= 1;
      if (timerDisplay) timerDisplay.textContent = App.formatTime(remaining);

      if (remaining <= 0) {
        window.clearInterval(this.resetTimerInterval);
        this.resetTimerInterval = null;
        if (resendButton) resendButton.disabled = false;
      }
    }, 1000);
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  },

  /* ── Login handler ─────────────────── */
  async handleLogin() {
    App.clearErrors('form-login');
    const email = document.getElementById('login-email').value.trim();
    const pw = document.getElementById('login-password').value;
    let valid = true;

    if (!email) {
      App.showError('login-email-err', 'Email is required.');
      App.setInputError('login-email', true);
      valid = false;
    } else if (!App.isSchoolEmail(email)) {
      App.showError('login-email-err', 'Please use your official .edu.ph school email.');
      App.setInputError('login-email', true);
      valid = false;
    }

    if (!pw) {
      App.showError('login-pw-err', 'Password is required.');
      App.setInputError('login-password', true);
      valid = false;
    }

    if (valid) {
      const result = await loginUser(email, pw);
      if (result.success) {
        userData.email = email;
        userData.password = pw;
        App.showToast("Login successful!");
        App.goTo('screen-dashboard');
      } else {
        App.showError('login-pw-err', result.message);
      }
    }
  },

  /* ── Sign-up handler ───────────────── */
  async handleSignup() {
    App.clearErrors('form-signup');
    const email = document.getElementById('signup-email').value.trim();
    const pw = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    let valid = true;

    if (!email) {
      App.showError('signup-email-err', 'Email is required.');
      App.setInputError('signup-email', true);
      valid = false;
    } else if (!App.isSchoolEmail(email)) {
      App.showError('signup-email-err', 'Please use your official .edu.ph school email.');
      App.setInputError('signup-email', true);
      valid = false;
    }

    if (!pw) {
      App.showError('signup-pw-err', 'Password is required.');
      App.setInputError('signup-password', true);
      valid = false;
    } else if (pw.length < 6) {
      App.showError('signup-pw-err', 'Password must be at least 6 characters.');
      App.setInputError('signup-password', true);
      valid = false;
    }

    if (!confirm) {
      App.showError('signup-confirm-err', 'Please confirm your password.');
      App.setInputError('signup-confirm', true);
      valid = false;
    } else if (pw !== confirm) {
      App.showError('signup-confirm-err', 'Passwords do not match.');
      App.setInputError('signup-confirm', true);
      valid = false;
    }

    if (valid) {
      const result = await registerUser(email, pw, {
        name: document.getElementById('profile-name')?.value || '',
        course: document.getElementById('profile-course')?.value || '',
        barangay: document.getElementById('profile-barangay')?.value || ''
      });

      if (result.success) {
        userData.email = email;
        userData.password = pw;
        App.showToast("Account created successfully!");
        App.goTo('screen-dashboard');
      } else {
        App.showError('signup-pw-err', result.message);
      }
    }
  },

  /* ── Profile / role selection / dashboard helpers ────────── */
  selectRole(role) {
    if (!role) return;
    userData.role = role;
    const riderBtn = document.getElementById('role-rider');
    const driverBtn = document.getElementById('role-driver');
    const continueBtn = document.getElementById('role-continue-btn');

    if (riderBtn && driverBtn) {
      riderBtn.classList.toggle('selected', role === 'rider');
      riderBtn.setAttribute('aria-checked', role === 'rider');
      driverBtn.classList.toggle('selected', role === 'driver');
      driverBtn.setAttribute('aria-checked', role === 'driver');
    }
    if (continueBtn) continueBtn.disabled = false;
  },

  handleRole() {
    if (!userData.role) {
      App.showToast('Please choose a role before continuing.', 'error');
      return;
    }
    App.goTo('screen-dashboard');
  },

  handleVerify() {
    App.showToast('Email code verification is not connected yet.', 'error');
  },

  resendCode() {
    App.showToast('Verification code resend is not connected yet.', 'error');
  },

  populateDashboard() {
    const welcomeName = document.getElementById('welcome-name');
    const welcomeMeta = document.getElementById('welcome-meta');
    const ctaLabel = document.getElementById('cta-label');
    const mainCta = document.getElementById('main-cta');

    if (welcomeName) {
      welcomeName.textContent = userData.name || 'Welcome to CommUnity!';
    }
    if (welcomeMeta) {
      welcomeMeta.textContent = userData.role
        ? `Logged in as ${userData.role === 'driver' ? 'Driver' : 'Rider'}`
        : 'Ready to find your first ride.';
    }
    if (ctaLabel) {
      ctaLabel.textContent = userData.role === 'driver' ? 'Offer a Ride' : 'Find a Ride';
    }
    if (mainCta) {
      mainCta.onclick = App.handleDashboardCta;
    }
  },

  handleDashboardCta() {
    const target = userData.role === 'driver'
      ? '../../Ride/html/offer_ride.html'
      : '../../Ride/html/find_ride.html';
    window.location.href = target;
  },

  handleProfile() {
    userData.name = document.getElementById('profile-name')?.value.trim() || '';
    userData.course = document.getElementById('profile-course')?.value.trim() || '';
    userData.barangay = document.getElementById('profile-barangay')?.value || '';
    App.goTo('screen-role');
  },

  skipProfile() {
    App.goTo('screen-role');
  },

  // … rest of your methods unchanged …
};

/* ── Tab slider init on load ────────── */
document.addEventListener('DOMContentLoaded', () => {
  App.switchTab('login');

  // Pressing Enter in auth forms
  const screenAuth = document.getElementById('screen-auth');
  if (screenAuth) {
    screenAuth.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const loginVisible = !document.getElementById('form-login').classList.contains('hidden');
      if (loginVisible) App.handleLogin();
      else App.handleSignup();
    });
  }

  // Pressing Enter in verify screen
  const screenVerify = document.getElementById('screen-verify');
  if (screenVerify) {
    screenVerify.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') App.handleVerify();
    });
  }

  if (window.location.protocol === 'file:') {
    App.showToast('Open this page from a local server so Firebase modules can load.', 'error');
  }
});

/* ── Animated canvas background ─────── */
(function initBackground() {
  // … unchanged …
})();

window.App = App;
