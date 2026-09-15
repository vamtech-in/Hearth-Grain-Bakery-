// Mobile navigation toggle
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");

toggle.addEventListener("click", function () {
  const isOpen = links.classList.toggle("open");

  toggle.setAttribute(
    "aria-expanded",
    isOpen ? "true" : "false"
  );
});

// Close mobile menu after clicking a link
links.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    links.classList.remove("open");

    toggle.setAttribute("aria-expanded", "false");
  });
});

// Weekly bread schedule
const loaves = {
  0: "Cinnamon Babka",
  1: "Miche au Levain",
  2: "Seeded Rye",
  3: "Pain de Campagne",
  4: "Sesame Whole Wheat",
  5: "Baguette Tradition",
  6: "Olive Fougasse"
};

// Get current day
const today = new Date().getDay();

// Highlight today's schedule item
const todayCell = document.querySelector(
  '.schedule-day[data-day="' + today + '"]'
);

if (todayCell) {
  todayCell.classList.add("today");
}

// Update today's loaf badge
const loafNameElement = document.getElementById("loafName");

if (loafNameElement && loaves[today]) {
  loafNameElement.textContent = loaves[today];
}

// Update footer year
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}