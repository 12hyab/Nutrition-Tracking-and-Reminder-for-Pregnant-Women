document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'http://127.0.0.1:5000/api';
  const token = localStorage.getItem('token');
  if (!token) return redirectToLogin('Please log in first.');

  const containers = {
    Breakfast: document.getElementById('breakfast-container'),
    Lunch: document.getElementById('lunch-container'),
    Snack: document.getElementById('snack-container'),
    Dinner: document.getElementById('dinner-container')
  };
  const suggestionsEl = document.getElementById("suggestions");
  const saveBtn = document.getElementById("save-intake");

  let userProfile = {};
  let savedIntake = [];
   // Fetch user profile
    async function fetchProfile() {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        return redirectToLogin('Session expired. Please log in again.');
      }
      if (!res.ok) throw new Error('Failed to fetch profile');
      return await res.json();
    } catch (err) {
      console.error(err);
      return redirectToLogin('Server error. Please log in again.');
    }
  }
  userProfile = await fetchProfile();
  // Load saved intake
  async function loadSavedIntake() {
    try {
      const res = await fetch(`${API_URL}/intake`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return [];
      const records = await res.json();
      const today = new Date().toLocaleDateString('en-CA');
      const todayRecord = records.find(r => new Date(r.date).toLocaleDateString('en-CA') === today);
      return todayRecord ? todayRecord.meals : [];
    } catch (err) {
      console.error('Failed to fetch saved intake', err);
      return [];
    }
  }
  savedIntake = await loadSavedIntake();
  // BMI & Suggestions
  function calculateBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  function getSuggestions(profile, totals) {
    const tips = [];
    const bmi = calculateBMI(profile.weight, profile.height);
    const trimester = profile.trimester || 2;

    if (bmi < 18.5) tips.push("Your BMI is low. Increase nutrient-dense calories.");
    else if (bmi < 25) tips.push("BMI is healthy. Maintain balanced nutrition.");
    else tips.push("BMI is high. Watch portion sizes and focus on nutrient-rich foods.");

    if (trimester === 1) tips.push("First trimester: focus on folate-rich foods and avoid high-mercury fish.");
    if (trimester === 2) tips.push("Second trimester: increase protein and calcium for fetal growth.");
    if (trimester === 3) tips.push("Third trimester: monitor sodium to prevent swelling and manage blood pressure.");

    if (totals.calories < profile.recommendedCalories) tips.push(`Below recommended calories (${profile.recommendedCalories} kcal).`);
    if (totals.protein < 60) tips.push("Add more protein (eggs, beans, lean meat).");
    if (totals.sodium > 2300) tips.push("Reduce salt intake.");

    if (profile.conditions.includes("anemia"))
      tips.push("Include iron-rich foods like spinach, lentils, and lean red meat.");
    if (profile.conditions.includes("gestational_diabetes"))
      tips.push("Limit sugar and monitor carbohydrate intake carefully.");

    return tips.join("<br>");
  }

   // Meal Data 
  const meals = [
    { id: 1, name: 'Beyeaynet', type: 'Breakfast', image: '../imgs/beyaynet.jpg', time: '08:00', calories: 150, protein: 5, carbs: 27, fats: 3, sodium: 50 },
    { id: 2, name: 'Egg Sandwich', type: 'Breakfast', image: '../imgs/avocado juice.jpg', time: '08:30', calories: 220, protein: 12, carbs: 25, fats: 8, sodium: 300 },
    { id: 3, name: 'Asa(fish)', type: 'Breakfast', image: '../imgs/fish.jpg', time: '12:30', calories: 250, protein: 30, carbs: 10, fats: 12, sodium: 400 },
    { id: 4, name: 'Bula', type: 'Breakfast', image: '../imgs/bula.jpg', time: '19:00', calories: 300, protein: 35, carbs: 0, fats: 20, sodium: 120 },
    { id: 5, name: 'Yetef Chechebsa', type: 'Breakfast', image:'../imgs/chechebsa.jpg', time: '15:30', calories: 100, protein: 4, carbs: 6, fats: 9, sodium: 0 },
    { id: 6, name: 'Chuko', type: 'Breakfast', image:'../imgs/chuko.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 7, name: 'Egg', type: 'Breakfast', image:'../imgs/egg.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 8, name: 'Enjera Firfir', type: 'Breakfast', image:'../imgs/Enjera firfir.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 9, name: 'Genfo(porrage)', type: 'Breakfast', image:'../imgs/genfo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 10, name: 'Hilbet', type: 'Breakfast', image:'../imgs/hilbet.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 11, name: 'Tihlo', type: 'Breakfast', image:'../imgs/Tihlo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 12, name: 'Papaya Juice', type: 'Breakfast', image:'../imgs/papaya juice.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 13, name: 'Shiro', type: 'Breakfast', image:'../imgs/shiro.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 14, name: 'Chechebsa', type: 'Breakfast', image:'../imgs/yesinde chechebsa.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 15, name: 'Yetekekele boklo', type: 'Breakfast', image:'../imgs/yetekekele bekolo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
   
 { id: 16, name: 'Beyeaynet', type: 'Lunch', image: '../imgs/beyaynet.jpg', time: '08:00', calories: 150, protein: 5, carbs: 27, fats: 3, sodium: 50 },
    { id: 17, name: 'Egg Sandwich', type: 'Lunch', image: '../imgs/avocado juice.jpg', time: '08:30', calories: 220, protein: 12, carbs: 25, fats: 8, sodium: 300 },
    { id: 18, name: 'Asa(fish)', type: 'Lunch', image: '../imgs/fish.jpg', time: '12:30', calories: 250, protein: 30, carbs: 10, fats: 12, sodium: 400 },
    { id: 19, name: 'Bula', type: 'Lunch', image: '../imgs/bula.jpg', time: '19:00', calories: 300, protein: 35, carbs: 0, fats: 20, sodium: 120 },
    { id: 20, name: 'Yetef Chechebsa', type: 'Lunch', image:'../imgs/chechebsa.jpg', time: '15:30', calories: 100, protein: 4, carbs: 6, fats: 9, sodium: 0 },
    { id: 21, name: 'Chuko', type: 'Lunch', image:'../imgs/chuko.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 22, name: 'Egg', type: 'Lunch', image:'../imgs/egg.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 23, name: 'Enjera Firfir', type: 'Lunch', image:'../imgs/Enjera firfir.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 24, name: 'Genfo(porrage)', type: 'Lunch', image:'../imgs/genfo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 25, name: 'Hilbet', type: 'Lunch', image:'../imgs/hilbet.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 26, name: 'Tihlo', type: 'Lunch', image:'../imgs/Tihlo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 27, name: 'Papaya Juice', type: 'Lunch', image:'../imgs/papaya juice.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 28, name: 'Shiro', type: 'Lunch', image:'../imgs/shiro.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 29, name: 'Chechebsa', type: 'Lunch', image:'../imgs/yesinde chechebsa.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 30, name: 'Yetekekele boklo', type: 'Lunch', image:'../imgs/yetekekele bekolo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
  
  
      { id: 31, name: 'Beyeaynet', type: 'Snack', image: '../imgs/beyaynet.jpg', time: '08:00', calories: 150, protein: 5, carbs: 27, fats: 3, sodium: 50 },
    { id: 32, name: 'Egg Sandwich', type: 'Snack', image: '../imgs/avocado juice.jpg', time: '08:30', calories: 220, protein: 12, carbs: 25, fats: 8, sodium: 300 },
    { id: 33, name: 'Asa(fish)', type: 'Snack', image: '../imgs/fish.jpg', time: '12:30', calories: 250, protein: 30, carbs: 10, fats: 12, sodium: 400 },
    { id: 34, name: 'Bula', type: 'Snack', image: '../imgs/bula.jpg', time: '19:00', calories: 300, protein: 35, carbs: 0, fats: 20, sodium: 120 },
    { id: 35, name: 'Yetef Chechebsa', type: 'Snack', image:'../imgs/chechebsa.jpg', time: '15:30', calories: 100, protein: 4, carbs: 6, fats: 9, sodium: 0 },
    { id: 36, name: 'Chuko', type: 'Snack', image:'../imgs/chuko.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 37, name: 'Egg', type: 'Snack', image:'../imgs/egg.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 38, name: 'Enjera Firfir', type: 'Snack', image:'../imgs/Enjera firfir.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 39, name: 'Genfo(porrage)', type: 'Snack', image:'../imgs/genfo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 40, name: 'Hilbet', type: 'Snack', image:'../imgs/hilbet.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 41, name: 'Tihlo', type: 'Snack', image:'../imgs/Tihlo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 42, name: 'Papaya Juice', type: 'Snack', image:'../imgs/papaya juice.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 43, name: 'Shiro', type: 'Snack', image:'../imgs/shiro.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 44, name: 'Chechebsa', type: 'Snack', image:'../imgs/yesinde chechebsa.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 45, name: 'Yetekekele boklo', type: 'Snack', image:'../imgs/yetekekele bekolo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },

        { id: 46, name: 'Beyeaynet', type: 'Dinner', image: '../imgs/beyaynet.jpg', time: '08:00', calories: 150, protein: 5, carbs: 27, fats: 3, sodium: 50 },
    { id: 47, name: 'Egg Sandwich', type: 'Dinner', image: '../imgs/avocado juice.jpg', time: '08:30', calories: 220, protein: 12, carbs: 25, fats: 8, sodium: 300 },
    { id: 48, name: 'Asa(fish)', type: 'Dinner', image: '../imgs/fish.jpg', time: '12:30', calories: 250, protein: 30, carbs: 10, fats: 12, sodium: 400 },
    { id: 49, name: 'Bula', type: 'Dinner', image: '../imgs/bula.jpg', time: '19:00', calories: 300, protein: 35, carbs: 0, fats: 20, sodium: 120 },
    { id: 50, name: 'Yetef Chechebsa', type: 'Dinner', image:'../imgs/chechebsa.jpg', time: '15:30', calories: 100, protein: 4, carbs: 6, fats: 9, sodium: 0 },
    { id: 51, name: 'Chuko', type: 'Dinner', image:'../imgs/chuko.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 52, name: 'Egg', type: 'Dinner', image:'../imgs/egg.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 53, name: 'Enjera Firfir', type: 'Dinner', image:'../imgs/Enjera firfir.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 54, name: 'Genfo(porrage)', type: 'Dinner', image:'../imgs/genfo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 55, name: 'Hilbet', type: 'Dinner', image:'../imgs/hilbet.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 56, name: 'Tihlo', type: 'Dinner', image:'../imgs/Tihlo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 57, name: 'Papaya Juice', type: 'Dinner', image:'../imgs/papaya juice.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 58, name: 'Shiro', type: 'Dinner', image:'../imgs/shiro.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 59, name: 'Chechebsa', type: 'Dinner', image:'../imgs/yesinde chechebsa.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 },
    { id: 60, name: 'Yetekekele boklo', type: 'Dinner', image:'../imgs/yetekekele bekolo.jpg', time: '16:00', calories: 120, protein: 6, carbs: 18, fats: 3, sodium: 40 }
  
  ];
  // Render meals
  async function renderMeals() {
    Object.keys(containers).forEach(type => containers[type].innerHTML = '');
    meals.forEach(meal => {
      const div = document.createElement('div');
      div.className = `meal-card ${meal.type.toLowerCase()}`;
      const savedMeal = savedIntake.find(m => Number(m.mealId) === meal.id);
      div.innerHTML = `
        <div class="meal-icon">
          ${meal.type === 'Breakfast' ? '<i class="fa-solid fa-sun"></i>' :
            meal.type === 'Lunch' ? '<i class="fa-solid fa-utensils"></i>' :
            meal.type === 'Snack' ? '<i class="fa-solid fa-coffee"></i>' :
            '<i class="fa-solid fa-moon"></i>'}
        </div>
        <img src="${meal.image}" alt="${meal.name}">
        <p>${meal.name} (${meal.calories} kcal)</p>
        <label>Time: <input type="time" value="${savedMeal ? savedMeal.time : meal.time}" class="meal-time-input"></label>
        <label>
          <input type="checkbox" data-id="${meal.id}"
            data-calories="${meal.calories}"
            data-protein="${meal.protein}"
            data-carbs="${meal.carbs}"
            data-fats="${meal.fats}"
            data-sodium="${meal.sodium}"
            ${savedMeal ? 'checked' : ''} /> Select
        </label>
      `;
      containers[meal.type].appendChild(div);
    });

    updateSummary();
    updateSuggestions();
  }
  // Summary & Suggestions
  function getTotals() {
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0, sodium: 0 };
    document.querySelectorAll('.meal-card input[type="checkbox"]:checked').forEach(cb => {
      totals.calories += +cb.dataset.calories;
      totals.protein += +cb.dataset.protein;
      totals.carbs += +cb.dataset.carbs;
      totals.fats += +cb.dataset.fats;
      totals.sodium += +cb.dataset.sodium;
    });
    return totals;
  }

  function updateSummary() {
    const totals = getTotals();
    document.getElementById('total-calories').textContent = totals.calories;
    document.getElementById('total-protein').textContent = totals.protein;
    document.getElementById('total-carbs').textContent = totals.carbs;
    document.getElementById('total-fats').textContent = totals.fats;
    document.getElementById('total-sodium').textContent = totals.sodium;

    const goalCalories = userProfile.recommendedCalories || 2000;
    document.getElementById('calories-bar').style.width = `${Math.min((totals.calories / goalCalories) * 100, 100)}%`;
  }

  function updateSuggestions() {
    const totals = getTotals();
    suggestionsEl.innerHTML = getSuggestions(userProfile, totals);
  }
  // Event listeners
  document.querySelector('.container')?.addEventListener('change', e => {
    if (e.target.matches('.meal-card input[type="checkbox"], .meal-time-input')) {
      updateSummary();
      updateSuggestions();
    }
  });

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    const selectedMeals = [];
    document.querySelectorAll('.meal-card input[type="checkbox"]:checked').forEach(cb => {
      const card = cb.closest('.meal-card');
      selectedMeals.push({ mealId: Number(cb.dataset.id), time: card.querySelector('.meal-time-input').value });
    });

    const totals = getTotals();
    const intakeData = { meals: selectedMeals, ...totals, date: new Date().toLocaleDateString('en-CA') };

    try {
      const res = await fetch(`${API_URL}/intake/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(intakeData)
      });
      if (!res.ok) throw new Error('Failed to save intake');
      alert("Today's intake saved successfully!");
      savedIntake = await loadSavedIntake();
      await renderMeals();
    } catch (err) {
      console.error(err);
      alert('Error saving intake. Try again later.');
    } finally {
      saveBtn.disabled = false;
    }
  });

  // Hamburger menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  menuToggle?.addEventListener('click', () => navLinks?.classList.toggle('active'));

  await renderMeals();
});
