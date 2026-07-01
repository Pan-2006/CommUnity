let selectedRating = 0;

const stars = document.querySelectorAll(".star");

stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = star.dataset.value;

    stars.forEach(s => {
      s.classList.remove("active");

      if(s.dataset.value <= selectedRating){
        s.classList.add("active");
      }
    });
  });
});

document.querySelectorAll(".payment-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    document
      .querySelectorAll(".payment-btn")
      .forEach(b => b.classList.remove("selected"));

    btn.classList.add("selected");

    showToast(`${btn.innerText.trim()} selected`);
  });
});

document
.getElementById("sos-btn")
.addEventListener("click", () => {

  const confirmed = confirm(
    "Emergency alert will be sent. Continue?"
  );

  if(confirmed){
    showToast("SOS Alert Sent");
  }
});

document
.getElementById("report-btn")
.addEventListener("click", () => {

  const reason = prompt(
    "Why are you reporting this user?"
  );

  if(reason){
    showToast("Report Submitted");
  }
});

document
.getElementById("submit-rating")
.addEventListener("click", () => {

  if(selectedRating === 0){
    showToast("Please select a rating");
    return;
  }

  showToast("Thank you for your feedback!");
});

function showToast(message){

  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}