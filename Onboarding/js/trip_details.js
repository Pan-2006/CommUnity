const Trip = {
  init() {
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
