// Initialize Mixpanel
window.mixpanel.init("2b4f86c3de663a32a76a6478568e2be7"); 

const storedName = localStorage.getItem('pmName');
if (storedName) {
  window.mixpanel.identify(storedName);
  window.mixpanel.people.set({
    "$name": storedName,
    "App": "Tracky Track"
  });
}
window.mixpanel.track("Page Loaded");

function saveName() {
  const name = document.getElementById('pmName').value;
  if (name.trim()) {
    localStorage.setItem('pmName', name);
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('tracker').style.display = 'block';
    document.getElementById('displayName').textContent = name;

    window.mixpanel.identify(name);
    window.mixpanel.people.set({ "$name": name });
    window.mixpanel.track("Name Saved");
  } else {
    alert('Please enter a valid name.');
  }
}

function deleteName() {
  localStorage.removeItem('pmName');
  alert('Name has been deleted. Please refresh the page to re-enter your name.');
  window.mixpanel.track("Name Deleted");
}

function toggleDarkMode() {
  const isDarkMode = document.getElementById('darkModeToggle').checked;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
  window.mixpanel.track("Dark Mode Toggled", { darkMode: isDarkMode });
}

function loadDarkMode() {
  const isDarkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
  document.body.classList.toggle('dark-mode', isDarkMode);
  document.getElementById('darkModeToggle').checked = isDarkMode;
}

function navigateTo(screen) {
  document.getElementById('tracker').style.display = screen === 'tracker' ? 'block' : 'none';
  document.getElementById('totals').style.display = screen === 'totals' ? 'block' : 'none';
  document.getElementById('settings').style.display = screen === 'settings' ? 'block' : 'none';
  document.querySelectorAll('nav button').forEach(button => button.classList.remove('active'));
  document.getElementById(`tab-${screen}`).classList.add('active');

  if (screen === 'totals') {
    updateYearlyTotals();
    loadWeeklyTotals();
  }

  window.mixpanel.track("Tab Switched", { tab: screen });
}

function submitData() {
  const interviews = parseInt(document.getElementById('interviews').value);
  const tests = parseInt(document.getElementById('tests').value);
  const demo = document.getElementById('demo').checked ? 'Yes' : 'No';

  const weekData = JSON.parse(localStorage.getItem('weeklyData')) || [];
  weekData.push({ week: new Date().toISOString().slice(0, 10), interviews, tests, demo });
  localStorage.setItem('weeklyData', JSON.stringify(weekData));

  updateYearlyTotals();
  loadWeeklyTotals();

  window.mixpanel.track("Data Submitted", { interviews, tests, demo });

  document.getElementById('result').innerHTML = `
    <p><strong>Customer Interviews:</strong> ${interviews || 0}</p>
    <p><strong>Assumption Tests:</strong> ${tests || 0}</p>
    <p><strong>Squad Did a Demo:</strong> ${demo}</p>
  `;
  document.getElementById('result').style.display = 'block';

  document.getElementById('interviews').value = 0;
  document.getElementById('tests').value = 0;
  document.getElementById('demo').checked = false;
}

function increment(id) {
  const input = document.getElementById(id);
  input.value = parseInt(input.value, 10) + 1;
}

function decrement(id) {
  const input = document.getElementById(id);
  const currentValue = parseInt(input.value, 10);
  if (currentValue > 0) {
    input.value = currentValue - 1;
  }
}

function updateYearlyTotals() {
  const weekData = JSON.parse(localStorage.getItem('weeklyData')) || [];
  let yearlyInterviews = 0;
  let yearlyTests = 0;

  weekData.forEach(entry => {
    yearlyInterviews += entry.interviews;
    yearlyTests += entry.tests;
  });

  // Update UI elements
  document.getElementById('yearlyInterviews').innerText = yearlyInterviews;
  document.getElementById('yearlyTests').innerText = yearlyTests;

  // Save the yearly totals to localStorage for persistence
  localStorage.setItem('yearlyTotals', JSON.stringify({ yearlyInterviews, yearlyTests }));
}

function loadWeeklyTotals() {
  const weekData = JSON.parse(localStorage.getItem('weeklyData')) || [];
  const weeklyTotalsDiv = document.getElementById('weeklyTotals');

  // Clear the weekly totals display
  weeklyTotalsDiv.innerHTML = '';

  // Iterate over weekly data and display it
  weekData.forEach((entry, index) => {
    weeklyTotalsDiv.innerHTML += `
      <p><strong>Week ${index + 1} (${entry.week}):</strong></p>
      <ul>
        <li>Customer Interviews: ${entry.interviews}</li>
        <li>Assumption Tests: ${entry.tests}</li>
        <li>Squad Did a Demo: ${entry.demo}</li>
      </ul>
    `;
  });
}

window.onload = function () {
  const storedName = localStorage.getItem('pmName');
  if (storedName) {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('tracker').style.display = 'block';
    document.getElementById('displayName').textContent = storedName;
  }
  loadDarkMode();
};
