"use strict";

/* ================================
   Mobile Navigation
================================ */

const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");

if (toggle && links) {
  toggle.addEventListener("click", function () {
    const isOpen = links.classList.toggle("open");

    toggle.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

    toggle.setAttribute(
      "aria-label",
      isOpen
        ? "Close navigation menu"
        : "Open navigation menu"
    );
  });

  /* Close mobile menu after clicking a link */
  links.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      links.classList.remove("open");

      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );
    });
  });

  /* Close menu using Escape key */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      links.classList.remove("open");

      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

      toggle.focus();
    }
  });
}

/* ================================
   Weekly Bake Schedule
================================ */

const loaves = {
  0: "Cinnamon Babka",
  1: "Miche au Levain",
  2: "Seeded Rye",
  3: "Pain de Campagne",
  4: "Sesame Whole Wheat",
  5: "Baguette Tradition",
  6: "Olive Fougasse"
};

/*
  JavaScript Date.getDay():

  Sunday    = 0
  Monday    = 1
  Tuesday   = 2
  Wednesday = 3
  Thursday  = 4
  Friday    = 5
  Saturday  = 6
*/

const today = new Date().getDay();

/* Highlight current day */
const todayCell = document.querySelector(
  '.schedule-day[data-day="' + today + '"]'
);

if (todayCell) {
  todayCell.classList.add("today");
}

/* Update today's loaf badge */
const loafNameElement = document.getElementById("loafName");

if (loafNameElement && loaves[today]) {
  loafNameElement.textContent = loaves[today];
}

/* ================================
   Footer Year
================================ */

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}