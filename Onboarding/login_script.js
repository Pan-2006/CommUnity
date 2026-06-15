/**
 * CommUnity — script.js
 * Handles: screen transitions, form validation, OTP input,
 * countdown timer, role selection, dashboard population,
 * animated canvas background, tab switching.
 */

'use strict';

/* ── App state ────────────────────────── */
const userData = {
  email: '',
  password: '',
  name: '',
  course: '',
  barangay: '',
  role: ''        // 'rider' | 'driver'
};

/* ── App controller ──────────────────── */
const App = {

  /* Navigate to a screen by its element id */
  goTo(screenId, context) {
    const current = document.querySelector('.screen.active');
    const next    = document.getElementById(screenId);
    if (!next || current === next) return;

    if (current) current.classList.remove('active');
    next.classList.add('active');

    // Context-aware side effects
    if (screenId === 'screen-auth' && context) {
      App.switchTab(context);
    }
    if (screenId === 'screen-verify') {
      App.initVerify();
    }
    if (screenId === 'screen-dashboard') {
      App.populateDashboard();
    }

    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /* ── Tab switcher (Login / Sign Up) ── */
  switchTab(tab) {
    const loginForm   = document.getElementById('form-login');
    const signupForm  = document.getElementById('form-signup');
    const tabLogin    = document.getElementById('tab-login');
    const tabSignup   = document.getElementById('tab-signup');
    const slider      = document.getElementById('tab-slider');
    const tabBar      = document.querySelector('.tab-bar');

    // Clear previous errors
    App.clearErrors('form-login');
    App.clearErrors('form-signup');

    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      tabLogin.classList.add('active');
      tabLogin.setAttribute('aria-selected', 'true');
      tabSignup.classList.remove('active');
      tabSignup.setAttribute('aria-selected', 'false');
    } else {
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      tabSignup.classList.add('active');
      tabSignup.setAttribute('aria-selected', 'true');
      tabLogin.classList.remove('active');
      tabLogin.setAttribute('aria-selected', 'false');
    }

    // Animate the sliding indicator
    requestAnimationFrame(() => {
      const activeBtn = tab === 'login' ? tabLogin : tabSignup;
      const rect  = activeBtn.getBoundingClientRect();
      const pbRect = tabBar.getBoundingClientRect();
      slider.style.left  = (rect.left - pbRect.left - 3) + 'px';
      slider.style.width = rect.width + 'px';
    });
  },

  /* ── Login handler ─────────────────── */
  handleLogin() {
    App.clearErrors('form-login');
    const email = document.getElementById('login-email').value.trim();
    const pw    = document.getElementById('login-password').value;
    let valid   = true;

    if (!email) {
      App.showError('login-email-err', 'Email is required.');
      App.setInputError('login-email', true);
      valid = false;
    } else if (!email.toLowerCase().includes('.edu.ph')) {
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
      userData.email = email;
      userData.password = pw;
      App.goTo('screen-verify');
    }
  },

  /* ── Sign-up handler ───────────────── */
  handleSignup() {
    App.clearErrors('form-signup');
    const email   = document.getElementById('signup-email').value.trim();
    const pw      = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    let valid     = true;

    if (!email) {
      App.showError('signup-email-err', 'Email is required.');
      App.setInputError('signup-email', true);
      valid = false;
    } else if (!email.toLowerCase().includes('.edu.ph')) {
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

    if (pw && confirm !== pw) {
      App.showError('signup-confirm-err', "Passwords don't match.");
      App.setInputError('signup-confirm', true);
      valid = false;
    }

    if (valid) {
      userData.email = email;
      userData.password = pw;
      App.goTo('screen-verify');
    }
  },

  /* ── Verification screen ───────────── */
  _timerInterval: null,
  _timerSeconds: 165,   // 02:45

  initVerify() {
    // Show email in pill
    const pill = document.getElementById('verify-email-display');
    pill.textContent = userData.email || 'your@school.edu.ph';

    // Reset code boxes
    const boxes = document.querySelectorAll('.code-box');
    boxes.forEach(b => {
      b.value = '';
      b.classList.remove('filled', 'error');
    });
    document.getElementById('code-err').textContent = '';

    // Wire up OTP navigation
    App.initCodeBoxes();

    // Start countdown
    App.startTimer();
  },

  initCodeBoxes() {
    const boxes = Array.from(document.querySelectorAll('.code-box'));

    boxes.forEach((box, i) => {
      // Replace listeners by cloning
      const clone = box.cloneNode(true);
      box.parentNode.replaceChild(clone, box);
    });

    // Re-query after replacement
    const freshBoxes = Array.from(document.querySelectorAll('.code-box'));

    freshBoxes.forEach((box, i) => {
      box.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val.slice(-1);
        if (val) {
          box.classList.add('filled');
          if (i < freshBoxes.length - 1) freshBoxes[i + 1].focus();
        } else {
          box.classList.remove('filled');
        }
        document.getElementById('code-err').textContent = '';
      });

      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (!box.value && i > 0) {
            freshBoxes[i - 1].value = '';
            freshBoxes[i - 1].classList.remove('filled');
            freshBoxes[i - 1].focus();
          }
        }
        if (e.key === 'ArrowLeft'  && i > 0) freshBoxes[i - 1].focus();
        if (e.key === 'ArrowRight' && i < freshBoxes.length - 1) freshBoxes[i + 1].focus();
      });

      box.addEventListener('focus', () => {
        box.select();
      });

      // Handle paste
      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const digits = text.replace(/\D/g, '').slice(0, 6);
        digits.split('').forEach((d, idx) => {
          if (freshBoxes[idx]) {
            freshBoxes[idx].value = d;
            freshBoxes[idx].classList.add('filled');
          }
        });
        const next = Math.min(digits.length, freshBoxes.length - 1);
        freshBoxes[next].focus();
      });
    });

    // Focus first box
    if (freshBoxes[0]) setTimeout(() => freshBoxes[0].focus(), 100);
  },

  startTimer() {
    clearInterval(App._timerInterval);
    App._timerSeconds = 165;
    App.updateTimerDisplay();

    App._timerInterval = setInterval(() => {
      App._timerSeconds--;
      App.updateTimerDisplay();
      if (App._timerSeconds <= 0) {
        clearInterval(App._timerInterval);
        document.getElementById('timer-display').textContent = 'Expired';
        document.getElementById('timer-display').style.color = 'var(--error)';
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const m = Math.floor(App._timerSeconds / 60);
    const s = App._timerSeconds % 60;
    const el = document.getElementById('timer-display');
    if (el) {
      el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      el.style.color = App._timerSeconds <= 30 ? 'var(--error)' : '';
    }
  },

  resendCode() {
    // Reset boxes
    const boxes = document.querySelectorAll('.code-box');
    boxes.forEach(b => {
      b.value = '';
      b.classList.remove('filled', 'error');
    });
    document.getElementById('code-err').textContent = '';

    App.startTimer();
    App.showToast('Code resent to ' + (userData.email || 'your email'));

    // Brief animation on resend button
    const btn = document.getElementById('resend-btn');
    if (btn) {
      btn.textContent = 'Sent!';
      btn.style.color = 'var(--green)';
      setTimeout(() => {
        btn.textContent = 'Resend code';
        btn.style.color = '';
      }, 2000);
    }
  },

  handleVerify() {
    const boxes = Array.from(document.querySelectorAll('.code-box'));
    const code  = boxes.map(b => b.value).join('');
    const errEl = document.getElementById('code-err');

    // Clear previous errors
    boxes.forEach(b => b.classList.remove('error'));
    errEl.textContent = '';

    if (code.length < 6) {
      errEl.textContent = 'Please enter the complete 6-digit code.';
      boxes.forEach(b => { if (!b.value) b.classList.add('error'); });
      return;
    }

    // Accept any 6-digit code (testing mode)
    clearInterval(App._timerInterval);
    App.showToast('Email verified successfully!');
    App.goTo('screen-profile');
  },

  /* ── Profile handler ───────────────── */
  handleProfile() {
    App.clearErrors('form-profile');
    const name     = document.getElementById('profile-name').value.trim();
    const course   = document.getElementById('profile-course').value;
    const barangay = document.getElementById('profile-barangay').value;
    let valid      = true;

    if (!name) {
      App.showError('profile-name-err', 'Your name is required.');
      App.setInputError('profile-name', true);
      valid = false;
    }

    if (!course) {
      App.showError('profile-course-err', 'Please select your course.');
      App.setInputError('profile-course', true);
      valid = false;
    }

    if (!barangay) {
      App.showError('profile-barangay-err', 'Please select your barangay.');
      App.setInputError('profile-barangay', true);
      valid = false;
    }

    if (valid) {
      userData.name     = name;
      userData.course   = course;
      userData.barangay = barangay;
      App.goTo('screen-role');
    }
  },

  skipProfile() {
    // Fill defaults so dashboard doesn't look empty
    const nameVal = document.getElementById('profile-name').value.trim();
    userData.name     = nameVal || 'Student';
    userData.course   = document.getElementById('profile-course').value   || 'Not set';
    userData.barangay = document.getElementById('profile-barangay').value || 'Not set';
    App.goTo('screen-role');
  },

  /* ── Role selection ────────────────── */
  selectRole(role) {
    userData.role = role;

    document.getElementById('role-rider').classList.remove('selected');
    document.getElementById('role-driver').classList.remove('selected');
    document.getElementById('role-rider').setAttribute('aria-checked', 'false');
    document.getElementById('role-driver').setAttribute('aria-checked', 'false');

    const chosen = document.getElementById('role-' + role);
    chosen.classList.add('selected');
    chosen.setAttribute('aria-checked', 'true');

    document.getElementById('role-continue-btn').disabled = false;
  },

  handleRole() {
    if (!userData.role) return;
    App.goTo('screen-dashboard');
  },

  /* ── Dashboard population ──────────── */
  populateDashboard() {
    const firstName = userData.name
      ? userData.name.split(' ')[0]
      : 'Student';

    // Avatar initials
    const initials = userData.name
      ? userData.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
      : '?';
    document.getElementById('welcome-avatar').textContent = initials;

    // Name
    document.getElementById('welcome-name').textContent =
      `Welcome, ${firstName}!`;

    // Meta tags
    const metaWrap = document.getElementById('welcome-meta');
    const roleLabel = userData.role === 'driver' ? 'Driver' : 'Rider';
    const roleColor = userData.role === 'driver' ? 'blue' : 'green';
    metaWrap.innerHTML = `
      <span class="meta-tag tag--${roleColor}">${roleLabel}</span>
      ${userData.course !== 'Not set' && userData.course
        ? `<span class="meta-tag tag--gray">${userData.course}</span>`
        : ''}
      ${userData.barangay !== 'Not set' && userData.barangay
        ? `<span class="meta-tag tag--gray">📍 ${userData.barangay}</span>`
        : ''}
    `;

    // CTA button
    const ctaLabel = document.getElementById('cta-label');
    ctaLabel.textContent = userData.role === 'driver' ? 'Offer a Ride' : 'Find a Ride';

    // Ride count (slight personalisation for drivers)
    document.getElementById('rides-count').textContent =
      userData.role === 'driver' ? '3' : '5';

    // Activity list
    const activityList = document.getElementById('activity-list');
    const sampleMatches = [
      { name: 'Maria Santos', from: 'Barangka Drive', role: 'Looking for ride', color: '#16A34A' },
      { name: 'Juan dela Cruz', from: 'Highway Hills', role: 'Offering ride', color: '#0057D9' },
      { name: 'Ana Reyes', from: 'Hulo', role: 'Looking for ride', color: '#16A34A' }
    ];

    activityList.innerHTML = sampleMatches.map(m => `
      <div class="activity-item">
        <div class="activity-avatar" style="background:${m.color}">
          ${m.name.split(' ').map(w => w[0]).slice(0,2).join('')}
        </div>
        <div class="activity-info">
          <p class="activity-name">${m.name}</p>
          <p class="activity-route">From ${m.from}</p>
        </div>
        <span class="activity-badge ${m.role.includes('Offering') ? 'tag--blue' : 'tag--green'}">
          ${m.role}
        </span>
      </div>
    `).join('');
  },

  /* ── Restart demo ──────────────────── */
  restart() {
    // Clear state
    Object.assign(userData, { email:'', password:'', name:'', course:'', barangay:'', role:'' });

    // Reset form fields
    ['login-email','login-password','signup-email','signup-password','signup-confirm',
     'profile-name'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ''; el.classList.remove('error'); }
    });
    ['profile-course','profile-barangay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
    });

    // Reset role cards
    document.getElementById('role-rider').classList.remove('selected');
    document.getElementById('role-driver').classList.remove('selected');
    document.getElementById('role-continue-btn').disabled = true;

    App.goTo('screen-splash');
  },

  /* ── Utility: show / clear errors ──── */
  showError(errId, msg) {
    const el = document.getElementById(errId);
    if (el) el.textContent = msg;
  },

  setInputError(inputId, hasError) {
    const el = document.getElementById(inputId);
    if (!el) return;
    if (hasError) {
      el.classList.add('error');
      el.addEventListener('input', () => {
        el.classList.remove('error');
      }, { once: true });
    } else {
      el.classList.remove('error');
    }
  },

  clearErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.field-input').forEach(el => el.classList.remove('error'));
  },

  /* ── Password visibility toggle ────── */
  togglePw(btn) {
    const inputId = btn.getAttribute('data-target');
    const input   = document.getElementById(inputId);
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
    btn.style.color = isText ? '' : 'var(--blue)';
  },

  /* ── Toast ─────────────────────────── */
  _toastTimeout: null,
  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(App._toastTimeout);
    App._toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
  }
};


/* ── Tab slider init on load ────────── */
document.addEventListener('DOMContentLoaded', () => {
  App.switchTab('login');

  // Pressing Enter in auth forms
  document.getElementById('screen-auth').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const loginVisible  = !document.getElementById('form-login').classList.contains('hidden');
    if (loginVisible) App.handleLogin();
    else App.handleSignup();
  });

  // Pressing Enter in verify screen
  document.getElementById('screen-verify').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') App.handleVerify();
  });
});


/* ── Animated canvas background ─────── */
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Soft blobs that drift slowly across the navy background
  const blobs = [
    { x: 0.15, y: 0.25, r: 0.35, vx:  0.00016, vy:  0.00011, rgb: [0, 107, 255] },
    { x: 0.75, y: 0.65, r: 0.40, vx: -0.00013, vy:  0.00015, rgb: [34, 197, 94] },
    { x: 0.50, y: 0.10, r: 0.28, vx:  0.00010, vy: -0.00013, rgb: [0,  60,  200] },
    { x: 0.88, y: 0.30, r: 0.25, vx: -0.00017, vy:  0.00010, rgb: [0, 107, 255] },
    { x: 0.08, y: 0.80, r: 0.30, vx:  0.00014, vy: -0.00012, rgb: [34, 197, 94] }
  ];

  // Subtle route-line network
  const nodes = Array.from({ length: 14 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003
  }));

  function drawFrame() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Deep navy base
    ctx.fillStyle = '#0B1437';
    ctx.fillRect(0, 0, W, H);

    // Soft radial blobs
    blobs.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0 || b.x > 1) b.vx *= -1;
      if (b.y < 0 || b.y > 1) b.vy *= -1;

      const cx = b.x * W, cy = b.y * H;
      const r  = b.r * Math.min(W, H);
      const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const [rr, gg, bb] = b.rgb;
      g.addColorStop(0, `rgba(${rr},${gg},${bb},0.18)`);
      g.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    // Transit network lines
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > 1) n.vx *= -1;
      if (n.y < 0 || n.y > 1) n.vy *= -1;
    });

    ctx.lineWidth = 0.5;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = (nodes[i].x - nodes[j].x) * W;
        const dy   = (nodes[i].y - nodes[j].y) * H;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const alpha = (1 - dist / 200) * 0.08;
          ctx.strokeStyle = `rgba(100,160,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x * W, nodes[i].y * H);
          ctx.lineTo(nodes[j].x * W, nodes[j].y * H);
          ctx.stroke();
        }
      }
    }

    // Node dots
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x * W, n.y * H, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100,160,255,0.25)';
      ctx.fill();
    });

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
})();