document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let dots = [];
        const dotCount = 40;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < dotCount; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 0.5
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            
            dots.forEach(dot => {
                dot.x += dot.vx;
                dot.y += dot.vy;

                if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
                if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }
        animate();
    }

    const welcomeHeading = document.getElementById('welcomeHeading');
    if (welcomeHeading) {
        const savedName = localStorage.getItem('loggedInStudentName');
        if (savedName && savedName.trim() !== '') {
            welcomeHeading.textContent = `Welcome back, ${savedName}! 👋`;
        } else {
            welcomeHeading.textContent = 'Welcome back, Student! 👋';
        }
    }

    const registerNowTrigger = document.getElementById('registerNowTrigger');
    if (registerNowTrigger) {
        registerNowTrigger.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const findRideCard = document.getElementById('findRideCard');
    const offerRideCard = document.getElementById('offerRideCard');

    if (findRideCard) {
        findRideCard.addEventListener('click', () => {
            window.location.href = 'find_ride.html';
        });
    }

    if (offerRideCard) {
        offerRideCard.addEventListener('click', () => {
            window.location.href = 'offer_ride.html';
        });
    }

    const notifAlertBadge = document.getElementById('notifAlertBadge');
    const dropdownCardWrapper = document.getElementById('dropdownCardWrapper');

    function loadRealTimeNotifications() {
        let notifArray = [];
        try {
            const savedNotifs = localStorage.getItem('commUnityNotifications');
            if (savedNotifs) {
                notifArray = JSON.parse(savedNotifs);
            }
        } catch (e) {
            notifArray = [];
        }

        if (notifArray.length === 0) {
            if (notifAlertBadge) notifAlertBadge.classList.add('hidden');
            if (dropdownCardWrapper) {
                dropdownCardWrapper.innerHTML = '<p class="no-notif-msg">No active match notifications available.</p>';
            }
            return;
        }

        const hasUnread = notifArray.some(n => n.isRead === false);
        if (hasUnread) {
            if (notifAlertBadge) notifAlertBadge.classList.remove('hidden');
        } else {
            if (notifAlertBadge) notifAlertBadge.classList.add('hidden');
        }

        const latestNotif = notifArray[0];
        if (dropdownCardWrapper) {
            dropdownCardWrapper.innerHTML = `
                <div class="match-item-card ${latestNotif.isRead ? 'is-read' : ''}" id="matchItemCard">
                    <div class="match-meta">
                        <span class="driver-title">${latestNotif.driverName}</span>
                        <span class="badge-status">${latestNotif.driverBadge}</span>
                    </div>
                    <p class="match-desc">${latestNotif.routeDetails}</p>
                </div>
            `;
        }
    }

    loadRealTimeNotifications();

    const notifTrigger = document.getElementById('notifTrigger');
    const notifDropdown = document.getElementById('notifDropdown');

    if (notifTrigger && notifDropdown) {
        notifTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
            
            if (!notifDropdown.classList.contains('hidden')) {
                try {
                    const savedNotifs = localStorage.getItem('commUnityNotifications');
                    if (savedNotifs) {
                        let notifArray = JSON.parse(savedNotifs);
                        notifArray = notifArray.map(n => ({ ...n, isRead: true }));
                        localStorage.setItem('commUnityNotifications', JSON.stringify(notifArray));
                    }
                } catch (err) {}
                
                if (notifAlertBadge) notifAlertBadge.classList.add('hidden');
                const innerCard = document.getElementById('matchItemCard');
                if (innerCard) innerCard.classList.add('is-read');
            }
        });
    }

    const seeMoreNotifTrigger = document.getElementById('seeMoreNotifTrigger');
    const allNotifsModal = document.getElementById('allNotifsModal');
    const notifModalCloseBtn = document.getElementById('notifModalCloseBtn');
    const modalHistoryList = document.getElementById('modalHistoryList');

    if (seeMoreNotifTrigger && allNotifsModal && notifModalCloseBtn && modalHistoryList) {
        seeMoreNotifTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (notifDropdown) notifDropdown.classList.add('hidden');
            
            let notifArray = [];
            try {
                const savedNotifs = localStorage.getItem('commUnityNotifications');
                if (savedNotifs) {
                    notifArray = JSON.parse(savedNotifs);
                }
            } catch (err) {}

            if (notifArray.length === 0) {
                modalHistoryList.innerHTML = '<p class="no-notif-msg">No history records available.</p>';
            } else {
                modalHistoryList.innerHTML = '';
                notifArray.forEach(n => {
                    const card = document.createElement('div');
                    card.className = 'match-item-card is-read';
                    card.innerHTML = `
                        <div class="match-meta">
                            <span class="driver-title">${n.driverName}</span>
                            <span class="badge-status">${n.driverBadge}</span>
                        </div>
                        <p class="match-desc">${n.routeDetails}</p>
                    `;
                    modalHistoryList.appendChild(card);
                });
            }
            
            allNotifsModal.classList.remove('hidden');
        });

        notifModalCloseBtn.addEventListener('click', () => {
            allNotifsModal.classList.add('hidden');
        });
        allNotifsModal.addEventListener('click', (e) => {
            if (e.target === allNotifsModal) {
                allNotifsModal.classList.add('hidden');
            }
        });
    }

    const learnMoreTrigger = document.getElementById('learnMoreTrigger');
    const learnMoreModal = document.getElementById('learnMoreModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    if (learnMoreTrigger && learnMoreModal && modalCloseBtn) {
        learnMoreTrigger.addEventListener('click', () => {
            learnMoreModal.classList.remove('hidden');
        });
        modalCloseBtn.addEventListener('click', () => {
            learnMoreModal.classList.add('hidden');
        });
        learnMoreModal.addEventListener('click', (e) => {
            if (e.target === learnMoreModal) {
                learnMoreModal.classList.add('hidden');
            }
        });
    }

    const searchInput = document.getElementById('locationSearchInput');
    const locationDropdown = document.getElementById('locationDropdown');
    const emptyStateText = document.getElementById('emptyStateText');

    let debounceTimer;

    if (searchInput && locationDropdown) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = searchInput.value.trim();

            if (query.length === 0) {
                locationDropdown.classList.add('hidden');
                if (emptyStateText) {
                    emptyStateText.textContent = '"Enter your route above to look for available commutes."';
                }
                return;
            }

            debounceTimer = setTimeout(() => {
                const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ph&q=${encodeURIComponent(query)}&limit=6`;

                fetch(searchUrl)
                    .then(response => response.json())
                    .then(data => {
                        locationDropdown.innerHTML = '';

                        if (data.length === 0) {
                            locationDropdown.classList.add('hidden');
                            return;
                        }

                        data.forEach(item => {
                            const div = document.createElement('div');
                            div.className = 'location-item';
                            div.setAttribute('data-value', item.display_name);
                            div.innerHTML = `
                                <i class="fa-solid fa-location-dot"></i>
                                <span class="location-name">${item.display_name}</span>
                            `;

                            div.addEventListener('click', () => {
                                searchInput.value = item.display_name;
                                locationDropdown.classList.add('hidden');
                                if (emptyStateText) {
                                    emptyStateText.textContent = `Route matches found for: ${item.display_name}! Showing active options...`;
                                }
                            });

                            locationDropdown.appendChild(div);
                        });

                        locationDropdown.classList.remove('hidden');
                    })
                    .catch(error => {
                        console.error('API Error:', error);
                    });
            }, 20);
        });
    }

    document.addEventListener('click', (e) => {
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifTrigger.contains(e.target)) {
            notifDropdown.classList.add('hidden');
        }
        if (locationDropdown && !locationDropdown.contains(e.target) && !searchInput.contains(e.target)) {
            locationDropdown.classList.add('hidden');
        }
    });
});