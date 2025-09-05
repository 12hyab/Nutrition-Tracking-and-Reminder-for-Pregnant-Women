document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const form = document.getElementById('regForm');
  const steps = document.querySelectorAll(".step");
  const progressItems = document.querySelectorAll(".progressbar li");
  let currentStep = 0;

  // Toggle navigation menu
  menuToggle?.addEventListener('click', () => navLinks.classList.toggle('active'));
  // Safe menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active')
    })
  }
  function showStep(n) {
    steps.forEach((step, i) => step.classList.toggle("active", i === n));
    progressItems.forEach((item, i) => item.classList.toggle("active", i <= n));

    document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
    document.getElementById("nextBtn").innerHTML = n === steps.length - 1 ? "Submit" : "Next";

    const firstInput = steps[n].querySelector("input, select, textarea");
    firstInput?.focus();


    const reviewStep = steps[n].querySelector('#reviewContainer');
    if (reviewStep) {
      const formData = Object.fromEntries(new FormData(form).entries());
      reviewStep.innerHTML = '';
      for (let [key, value] of Object.entries(formData)) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        reviewStep.innerHTML += `<p><strong>${label}:</strong> ${value || 'N/A'}</p>`;
      }
    }

    currentStep = n;
  }

  //  Validation
  function showError(element, msg) {
    const errorContainer = element.closest(".step").querySelector(".error");
    if (errorContainer) errorContainer.textContent = msg;
    else alert(msg);
  }

  function validateStep(stepIndex) {
    const inputs = steps[stepIndex].querySelectorAll("input[required], select[required], textarea[required]");
    for (let input of inputs) {
      if (!input.value.trim()) {
        return showError(input, "Please fill all required fields.");
      }
    }

    if (stepIndex === 0) {
      const password = form.password.value;
      const confirm = form.confirmPassword.value;
      if (password !== confirm) {
        return showError(form.confirmPassword, "Passwords do not match!");
      }
    }

    steps[stepIndex].querySelectorAll(".error").forEach(el => el.textContent = '');
    return true;
  }

  //Navigation
  function nextPrev(n) {
    if (n === 1 && !validateStep(currentStep)) return;

    const newStep = currentStep + n;
    if (newStep >= steps.length) {
      submitForm();
      return;
    }

    showStep(newStep);
  }

  //Progress Bar Click
  progressItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      if (validateStep(currentStep)) showStep(index);
    });
  });

  //Button Handlers 
  document.getElementById("prevBtn").onclick = () => nextPrev(-1);
  document.getElementById("nextBtn").onclick = () => nextPrev(1);

  form.addEventListener('submit', e => e.preventDefault());

  // Submit Form 
  async function submitForm() {
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userId', data.userId);
        alert(data.msg);
        form.reset();
        window.location.href = 'profile.html';
      } else {
        alert(data.msg || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    }
  }
  showStep(currentStep);
});
