const Trip = {
  defaults: {
    from: 'University Avenue',
    to: 'Central Barangay Market',
    departure: 'Today · 9:15 AM',
    seats: '2 / 4 available',
    fare: '₱75.00',
    status: 'Confirmed',
    driverName: 'Danica Ramos',
    driverInitials: 'DR',
    driverRating: '4.9 ⭐',
    driverVehicle: 'Honda City',
    pickup: 'Main Entrance, University Avenue',
    dropoff: 'Central Barangay Market, Near Gate 2',
    notes: 'Bring a reusable bag and be ready at the gate by 9:10 AM.'
  },

  getData() {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get('data');
      if (encoded) {
        const decoded = JSON.parse(atob(encoded));
        return { ...this.defaults, ...decoded };
      }
    } catch (e) {
      console.warn('Failed to parse trip data from URL', e);
    }

    try {
      const stored = localStorage.getItem('commUnityTripDetails');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.defaults, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse trip data from localStorage', e);
    }

    return this.defaults;
  },

  populate(data) {
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el && value) el.textContent = value;
    };

    set('trip-from', data.from);
    set('trip-to', data.to);
    set('trip-departure', data.departure);
    set('trip-seats', data.seats);
    set('trip-fare', data.fare);
    set('trip-status', data.status);
    set('driver-name', data.driverName);
    set('driver-initials', data.driverInitials);
    set('driver-rating', data.driverRating);
    set('driver-vehicle', data.driverVehicle);
    set('trip-pickup', data.pickup);
    set('trip-dropoff', data.dropoff);
    set('trip-notes', data.notes);

    const preview = document.getElementById('route-preview');
    if (preview && data.from && data.to) {
      preview.classList.add('has-route');
    }
  },

  init() {
    const data = this.getData();
    this.populate(data);

    document.getElementById('contact-driver')?.addEventListener('click', () => {
      Trip.showToast('Driver contact info is not active in this mockup.');
    });

    document.getElementById('cancel-trip')?.addEventListener('click', () => {
      Trip.showToast('This is a mock page, trip cancel is disabled.');
    });
  },

  goBack() {
    window.history.back();
  },

  showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(this.toastTimeout);
    this.toastTimeout = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  }
};

document.addEventListener('DOMContentLoaded', () => Trip.init());
window.Trip = Trip;
