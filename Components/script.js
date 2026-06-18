document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let walletBalance = 0.00;
    let currentFare = 0.00;
    let isDriverMode = false;
    let sosTimer;
    let isSubscribed = false; // Added missing structural state variable

    // --- DOM Elements ---
    const pickupSelect = document.getElementById('pickupInput');
    const dropoffSelect = document.getElementById('dropoffInput');
    const priceDisplay = document.getElementById('priceDisplay');
    const totalPayDisplay = document.querySelector('.totalPay');
    const walletDisplay = document.getElementById('walletBalance');
    const driverDisplay = document.getElementById('driverDisplay');

    const payInputBtn = document.getElementById('payInputBtn');
    const payFinalBtn = document.getElementById('payFinalBtn');
    
    const paymentModal = document.getElementById('paymentModal');
    const gcashNumber = document.getElementById('gcashNumber');
    const topUpAmountInput = document.getElementById('topUpAmount');
    const savePaymentBtn = document.getElementById('savePayment');

    // Row 3 Elements
    const refreshRidesBtn = document.getElementById('refreshRidesBtn');
    const ridesDynamicContent = document.getElementById('ridesDynamicContent');
    const routeIcon = document.getElementById('routeIcon');

    const notifyMeBtn = document.getElementById('notifyMeBtn');

    const leaderboardDrawer = document.getElementById('leaderboardDrawer');
    const openLeaderboardBtn = document.getElementById('openLeaderboardBtn');
    const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');

    const sosBtn = document.getElementById('sosBtn');
    const progressFill = document.getElementById('sosProgress');

    // --- 1. UTILITY: GLASS TOAST SYSTEM ---
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    };

    // --- 2. UTILITY: ANIMATED PRICE COUNT-UP ---
    const animatePrice = (target) => {
        let current = parseFloat(priceDisplay.innerText.replace('₱ ', '')) || 0;
        const increment = (target - current) / 10;
        const timer = setInterval(() => {
            current += increment;
            priceDisplay.innerText = `₱ ${current.toFixed(2)}`;
            if (totalPayDisplay) totalPayDisplay.innerText = current.toFixed(2);
            
            if (Math.abs(current - target) < 0.5) {
                priceDisplay.innerText = `₱ ${target.toFixed(2)}`;
                if (totalPayDisplay) totalPayDisplay.innerText = target.toFixed(2);
                clearInterval(timer);
            }
        }, 30);
    };

    // --- 3. FARE LOGIC ---
    const calculateFare = () => {
        if (!pickupSelect || !dropoffSelect) return;
        
        const pickup = pickupSelect.value.trim();
        const dropoff = dropoffSelect.value.trim();

        if (pickup !== "" && dropoff !== "") {
            currentFare = 25.00; // Demo flat fare
            const matchCount = Math.floor(Math.random() * 4) + 1;

            if (driverDisplay) {
                driverDisplay.innerText = isDriverMode
                    ? `${matchCount} Students found`
                    : `${matchCount} Drivers nearby`;
            }

            animatePrice(currentFare);
        } else {
            currentFare = 0;
            if (driverDisplay) driverDisplay.innerText = "Select locations...";
            animatePrice(0);
        }
    };

    if (pickupSelect) pickupSelect.addEventListener('input', calculateFare);
    if (dropoffSelect) dropoffSelect.addEventListener('input', calculateFare);

    // --- 4. TOGGLE MODE (Find/Offer) ---
    window.toggleMode = (btn, mode) => {
        const btns = btn.parentElement.querySelectorAll('.toggle-btn');
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        isDriverMode = (mode === 'driver');
        document.querySelector('#rideCard .label').innerText = isDriverMode ? 'Offer Ride' : 'Commute Matcher';
        
        if (payFinalBtn) {
            if (isDriverMode) {
                payFinalBtn.innerHTML = `<i class="fa-solid fa-car"></i> Start Route & Collect`;
                payFinalBtn.style.background = 'var(--blue-light)';
                payFinalBtn.style.borderColor = 'var(--blue-border)';
            } else {
                payFinalBtn.innerHTML = `<i class="fa-solid fa-check-double"></i> Pay ₱ <span class="totalPay">${currentFare.toFixed(2)}</span>`;
                payFinalBtn.style.background = 'var(--green-light)';
                payFinalBtn.style.borderColor = 'var(--green-border)';
            }
        }
        
        calculateFare();
    };

    // --- 5. MODAL GCASH TOP-UP LOGIC ---
    if (payInputBtn) {
        payInputBtn.addEventListener('click', () => {
            if (paymentModal) paymentModal.style.display = 'flex';
        });
    }

    if (savePaymentBtn) {
        savePaymentBtn.addEventListener('click', () => {
            const num = gcashNumber.value.trim();
            const rawAmount = parseFloat(topUpAmountInput.value);

            if (num.length < 10) {
                showToast("Enter a valid mobile account number", "error");
                return;
            }

            if (isNaN(rawAmount) || rawAmount <= 0) {
                showToast("Please enter a valid amount greater than ₱0.00", "error");
                return;
            }

            walletBalance += rawAmount;
            if (walletDisplay) walletDisplay.innerText = walletBalance.toFixed(2);
            
            if (paymentModal) paymentModal.style.display = 'none';
            showToast(`GCash Top Up Success! +₱${rawAmount.toFixed(2)} added`, "success");
            
            gcashNumber.value = "";
            topUpAmountInput.value = "";
        });
    }

    // --- 6. FINAL BOOKING / ROUTE START ACTION ---
    if (payFinalBtn) {
        payFinalBtn.addEventListener('click', () => {
            if (currentFare <= 0) {
                showToast("Please enter your pickup and destination locations first.", "info");
                return;
            }

            if (isDriverMode) {
                const passiveMatches = Math.floor(Math.random() * 3) + 1; 
                const earnings = currentFare * passiveMatches;
                
                walletBalance += earnings;
                if (walletDisplay) walletDisplay.innerText = walletBalance.toFixed(2);
                
                showToast(`Route active! Collected ₱${earnings.toFixed(2)} from ${passiveMatches} students.`, "success");
            } else {
                if (walletBalance >= currentFare) {
                    walletBalance -= currentFare;
                    if (walletDisplay) walletDisplay.innerText = walletBalance.toFixed(2);
                    
                    showToast("Fare Contribution Paid! Driver notified.", "success");
                } else {
                    showToast("Insufficient Balance! Top up using your GCash button.", "error");
                    return;
                }
            }

            if (pickupSelect) pickupSelect.value = "";
            if (dropoffSelect) dropoffSelect.value = "";
            calculateFare();
        });
    }

    // --- 7. SOS LOGIC ---
    const resetSOS = () => {
        clearInterval(sosTimer);
        if (progressFill) progressFill.style.height = '0%';
        if (sosBtn) sosBtn.classList.remove('vibrating');
    };

    const startSOS = (e) => {
        e.preventDefault();
        let progress = 0;
        if (sosBtn) sosBtn.classList.add('vibrating');
        sosTimer = setInterval(() => {
            progress += 5;
            if (progressFill) progressFill.style.height = progress + '%';
            if (progress >= 100) {
                clearInterval(sosTimer);
                showEmergencyAlert();
                resetSOS();
            }
        }, 100);
    };

    const showEmergencyAlert = () => {
        const overlay = document.createElement('div');
        overlay.className = 'emergency-overlay';
        overlay.innerHTML = `
            <div class="emergency-box">
                <h1>🚨 EMERGENCY ALERT SENT</h1>
                <p>Campus Security has been notified</p>
                <p style="margin-top:10px; font-weight:700;">Your location is being tracked</p>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 4000);
    };

    if (sosBtn) {
        sosBtn.addEventListener('mousedown', startSOS);
        sosBtn.addEventListener('mouseup', resetSOS);
        sosBtn.addEventListener('mouseleave', resetSOS);
        sosBtn.addEventListener('touchstart', startSOS);
        sosBtn.addEventListener('touchend', resetSOS);
    }

    // --- 8. ROW 3 COMPONENT LOGIC ---

    // Card 1 Controller: Dynamic Simulation Fetcher
    if (refreshRidesBtn) {
        refreshRidesBtn.addEventListener('click', () => {
            if (routeIcon) routeIcon.classList.add('spinning');
            ridesDynamicContent.innerHTML = `
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:15px;">
                    <i class="fa-solid fa-circle-notch spinning" style="color:var(--blue);"></i> Syncing active routes...
                </p>
            `;

            setTimeout(() => {
                if (routeIcon) routeIcon.classList.remove('spinning');
                showToast("Active routes updated successfully!", "success");

                ridesDynamicContent.innerHTML = `
                    <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top:10px;">
                        <div class="route-row-item">
                            <span>📍 Gate 3 → LRT Station</span>
                            <strong style="color:var(--green);">₱25.00</strong>
                        </div>
                        <div class="route-row-item">
                            <span>📍 Dorm Hub → Campus Gym</span>
                            <strong style="color:var(--green);">₱15.00</strong>
                        </div>
                    </div>
                    <button class="btn-primary" id="resetRidesSimulation" style="margin-top:12px; padding: 6px 15px; font-size: 0.7rem; background: transparent; border: 1px solid var(--glass-border);">Clear</button>
                `;

                document.getElementById('resetRidesSimulation').addEventListener('click', () => {
                    ridesDynamicContent.innerHTML = `
                        <h3 style="font-weight: 800; font-size: 1.1rem; margin-top: 10px;">No active rides</h3>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; margin-bottom: 15px;">Drivers haven't posted routes for today.</p>
                        <button class="btn-primary" id="refreshRidesBtn" style="padding: 8px 20px; font-size: 0.8rem;">Refresh</button>
                    `;
                    location.reload(); 
                });

            }, 1200);
        });
    }

    // Card 2 Controller: Notification Toggle (Integrated)
    if (notifyMeBtn) {
        notifyMeBtn.addEventListener('click', () => {
            isSubscribed = !isSubscribed;

            if (isSubscribed) {
                notifyMeBtn.innerText = "✓ Subscribed";
                notifyMeBtn.style.background = "transparent";
                notifyMeBtn.style.border = "1px solid var(--green-border)";
                notifyMeBtn.style.color = "var(--green)";
                showToast("Notifications enabled! We'll alert you when a match opens.", "success");
            } else {
                notifyMeBtn.innerText = "Notify Me";
                notifyMeBtn.style.background = "orange";
                notifyMeBtn.style.border = "none";
                notifyMeBtn.style.color = "white";
                showToast("Match alerts disabled.", "info");
            }
        });
    }

    // Card 3 Controller: Slide-Over Drawer Handlers
    if (openLeaderboardBtn) {
        openLeaderboardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (leaderboardDrawer) {
                leaderboardDrawer.classList.add('open');
                leaderboardDrawer.style.right = "0px";
            }
        });
    }

    if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (leaderboardDrawer) {
                leaderboardDrawer.classList.remove('open');
                leaderboardDrawer.style.right = "-420px";
            }
        });
    }

    // Global Overlay Dismiss Click Watcher
    window.addEventListener('click', (e) => {
        if (leaderboardDrawer && e.target === leaderboardDrawer) {
            leaderboardDrawer.classList.remove('open');
            leaderboardDrawer.style.right = "-420px";
        }
    });
});

// Outside DOMContentLoaded Wrapper Boundary
function closeModals() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) paymentModal.style.display = 'none';
}
