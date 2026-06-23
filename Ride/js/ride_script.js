document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let dots = [];
        const dotCount = 45;

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
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
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
});

// Ride integration
let pickupLocation = null;
let dropoffLocation = null;

function updateRoutePreview() {
    const preview = document.getElementById('route-preview');
    if (!preview) return;

    const pickup = document.getElementById('find-pickup')?.value?.trim();
    const dropoff = document.getElementById('find-dropoff')?.value?.trim();

    if (pickup && dropoff) {
        preview.innerHTML = `
            <div class="route-line-preview">
                <div class="route-point-preview route-point-preview--start">
                    <i class="fa-solid fa-circle-dot"></i>
                    <span>${pickup}</span>
                </div>
                <div class="route-line-preview--line"></div>
                <div class="route-point-preview route-point-preview--end">
                    <i class="fa-solid fa-flag-checkered"></i>
                    <span>${dropoff}</span>
                </div>
            </div>
        `;
        preview.classList.add('has-route');
    } else {
        preview.innerHTML = `<i class="fa-solid fa-route"></i><span>Your route will appear here after searching</span>`;
        preview.classList.remove('has-route');
    }
}

function switchTab(tabId) {
    // Buttons
    document.getElementById('tab-find').classList.remove('active');
    document.getElementById('tab-offer').classList.remove('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');

    // Sections
    document.getElementById('section-find').classList.remove('active');
    document.getElementById('section-offer').classList.remove('active');
    document.getElementById(`section-${tabId}`).classList.add('active');

    // Reset results on switch
    if(tabId === 'find') {
        document.getElementById('match-results').classList.add('hidden');
    }
}

function searchRides() {
    const pickup = document.getElementById('find-pickup').value;
    const dropoff = document.getElementById('find-dropoff').value;
    const time = document.getElementById('find-time').value;

    if (!pickup || !dropoff) {
        showToast("Please enter both pickup and destination.");
        return;
    }

    updateRoutePreview();

    console.log('Searching rides for', { pickup, dropoff, time });

    const resultsContainer = document.getElementById('match-results');
    const resultsList = document.getElementById('results-list');
    resultsContainer.classList.remove('hidden');
    

    resultsList.innerHTML = `<p style="text-align: center; color: var(--text-hint); font-size: 0.9rem;"><i class="fa-solid fa-spinner fa-spin"></i> Finding riders matching your route...</p>`;

    setTimeout(() => {
        const matches = [
            { name: "Marvin S.", vehicle: "Toyota Vios • ABC 1234", seats: "2/4", cost: "₱45.00" },
            { name: "Elena R.", vehicle: "Honda Civic • XYZ 9876", seats: "1/4", cost: "₱50.00" },
            { name: "Mark D.", vehicle: "Mitsubishi Mirage • DEF 567", seats: "3/4", cost: "₱40.00" }
        ];

        let htmlString = "";
        matches.forEach(match => {
            htmlString += `
                <div class="match-card">
                    <div class="match-info">
                        <div class="driver-avatar"><i class="fa-solid fa-user-astronaut"></i></div>
                        <div class="driver-details">
                            <h4>${match.name}</h4>
                            <p><i class="fa-solid fa-car-side"></i> ${match.vehicle}</p>
                        </div>
                    </div>
                    <div class="match-meta">
                        <div class="match-contribution">${match.cost}</div>
                        <div class="match-seats"><i class="fa-solid fa-users"></i> ${match.seats} seats</div>
                        <br>
                        <button class="request-btn" onclick="requestRide(this)">Request</button>
                    </div>
                </div>
            `;
        });
        resultsList.innerHTML = htmlString;
    }, 800);
}

function requestRide(btnElement) {
    btnElement.innerText = "Requested!";
    btnElement.style.background = "var(--green)";
    showToast("Ride request sent to the driver.");

    const matchCard = btnElement.closest('.match-card');
    if (!matchCard) return;

    const driverName = matchCard.querySelector('.driver-details h4')?.textContent || 'Driver';
    const vehicle = matchCard.querySelector('.driver-details p')?.textContent || '';
    const cost = matchCard.querySelector('.match-contribution')?.textContent || '₱0.00';
    const seats = matchCard.querySelector('.match-seats')?.textContent || '';

    const tripData = {
      from: 'Your Barangay',
      to: 'Campus',
      departure: 'Today · 9:15 AM',
      seats: seats.replace(' seats', '') + ' available',
      fare: cost,
      status: 'Confirmed',
      driverName: driverName,
      driverInitials: driverName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      driverRating: '4.9 ⭐',
      driverVehicle: vehicle.replace(/•/g, '·'),
      pickup: 'Main Entrance, University Avenue',
      dropoff: 'Central Barangay Market, Near Gate 2',
      notes: 'Bring a reusable bag and be ready at the gate by 9:10 AM.'
    };

    try {
      localStorage.setItem('commUnityTripDetails', JSON.stringify(tripData));
    } catch (e) {}

    const tripUrl = '../../Trip Details/html/trip_details.html';
    setTimeout(() => {
      window.location.replace(tripUrl);
    }, 800);
}

function postRide() {
    const pickup = document.getElementById('offer-pickup').value;
    const time = document.getElementById('offer-time').value;
    const seats = document.getElementById('offer-seats').value;

    if (!pickup || !time || !seats) {
        showToast("Please fill all details before posting.");
        return;
    }

    showToast("Ride successfully posted! Waiting for passengers.");
    
    document.getElementById('offer-pickup').value = "";
    document.getElementById('offer-time').value = "";
    document.getElementById('offer-seats').value = "";
}

let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}