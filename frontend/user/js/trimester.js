
  // Mobile menu toggle
  document.getElementById('menu-toggle').addEventListener('click', function() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
  });
  
  // Initialize progress tracker
  const progressFill = document.getElementById('progress-fill');
  const currentWeek = document.getElementById('current-week');
  const currentMonth = document.getElementById('current-month');
  const week = 6;
  const month = 2;
  const progressPercentage = (week / 40) * 100;
  
  progressFill.style.width = `${progressPercentage}%`;
  currentWeek.textContent = week;
  currentMonth.textContent = month;
  let scrollPosition = 0;

  document.querySelectorAll('.trimester-btn').forEach(btn => {
    btn.addEventListener('click', function() {

      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      document.querySelectorAll('.trimester-btn').forEach(b => {
        b.classList.remove('active');
      });
      // Add active class to clicked button
      this.classList.add('active');
      const trimester = this.getAttribute('data-trimester');
      
      // Hide all month navigation
      document.querySelectorAll('.month-nav').forEach(nav => {
        nav.style.display = 'none';
      });
      
      // Show the month navigation for the selected trimester
      document.getElementById(`month-nav-${trimester}`).style.display = 'flex';
      
      // Reset month buttons
      const monthButtons = document.querySelectorAll(`#month-nav-${trimester} .month-btn`);
      monthButtons.forEach(btn => btn.classList.remove('active'));
      if (monthButtons.length > 0) {
        monthButtons[0].classList.add('active');
      }
      
      // Hide all month sections
      document.querySelectorAll('.month-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Show the first month of the selected trimester
      let firstMonthId;
      if (trimester === 'first') {
        firstMonthId = 'month-1';
      } else if (trimester === 'second') {
        firstMonthId = 'month-4';
      } else if (trimester === 'third') {
        firstMonthId = 'month-7';
      }
      
      document.getElementById(firstMonthId).classList.add('active');
      
      // Restore scroll position after a brief delay to allow DOM to update
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 50);
    });
  });
  
  // Month navigation
  document.querySelectorAll('.month-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Store current scroll position
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      const month = this.getAttribute('data-month');
      
      // Remove active class from all month buttons in this trimester
      const trimesterNav = this.closest('.month-nav');
      trimesterNav.querySelectorAll('.month-btn').forEach(b => {
        b.classList.remove('active');
      });
      this.classList.add('active');
      
      // Hide all month sections
      document.querySelectorAll('.month-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Show the selected month section
      document.getElementById(`month-${month}`).classList.add('active');
      
      // Restore scroll position after a brief delay to allow DOM to update
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 50);
    });
  });
  
  // Week section toggle
  document.querySelectorAll('.week-header').forEach(header => {
    header.addEventListener('click', function() {
      const content = this.nextElementSibling;
      const toggleIcon = this.querySelector('.week-toggle i');
      
      content.classList.toggle('active');
      
      // Change icon
      if (content.classList.contains('active')) {
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
      } else {
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
      }
    });
  });
