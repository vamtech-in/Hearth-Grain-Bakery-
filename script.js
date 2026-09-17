"use strict";

/* =========================================================
   Hearth & Grain Bakery
   Complete JavaScript
========================================================= */

/* ================================
   Mobile Navigation
================================ */

const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");

function closeMobileMenu() {
  if (!toggle || !links) return;

  links.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open navigation menu");
}

function openMobileMenu() {
  if (!toggle || !links) return;

  links.classList.add("open");
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", "Close navigation menu");
}

if (toggle && links) {
  toggle.addEventListener("click", function () {
    const isOpen = links.classList.contains("open");

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  /* Close menu after clicking any navigation link */
  links.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      closeMobileMenu();
    });
  });

  /* Close menu using Escape key */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMobileMenu();
      toggle.focus();
    }
  });

  /* Close menu when clicking outside */
  document.addEventListener("click", function (event) {
    const clickedInsideMenu = links.contains(event.target);
    const clickedToggle = toggle.contains(event.target);

    if (
      links.classList.contains("open") &&
      !clickedInsideMenu &&
      !clickedToggle
    ) {
      closeMobileMenu();
    }
  });

  /* Close mobile menu when switching to desktop */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 800) {
      closeMobileMenu();
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

const today = new Date().getDay();

const todayCell = document.querySelector(
  '.schedule-day[data-day="' + today + '"]'
);

if (todayCell) {
  todayCell.classList.add("today");
}

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

/* ================================
   Smooth Scroll
================================ */

document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (event) {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      event.preventDefault();

      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

/* ================================
   Image Loading Handling
================================ */

const bakeryImages = document.querySelectorAll("img");

bakeryImages.forEach(function (image) {
  image.addEventListener("load", function () {
    image.classList.add("image-loaded");
  });

  image.addEventListener("error", function () {
    image.classList.add("image-load-error");

    /*
      Keeps the website layout stable if an image
      is missing or the image path is incorrect.
    */
    image.setAttribute(
      "alt",
      "Bakery image unavailable"
    );
  });
});

/* ================================
   Current Navigation Link
================================ */

const currentPage = window.location.pathname;

document.querySelectorAll(".nav-links a").forEach(function (link) {
  const linkPath = link.getAttribute("href");

  if (
    linkPath &&
    linkPath !== "#" &&
    currentPage.endsWith(linkPath)
  ) {
    link.classList.add("active");
  }
});

/* ================================
   Scroll Header Effect
================================ */

const header = document.querySelector(".site-header");

function updateHeaderOnScroll() {
  if (!header) return;

  if (window.scrollY > 20) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", updateHeaderOnScroll, {
  passive: true
});

updateHeaderOnScroll();

/* ================================
   Reveal Animation on Scroll
================================ */

const revealElements = document.querySelectorAll(
  ".section-heading, .menu-category, .story-content, .story-image, .visit-content, .visit-card"
);

if ("IntersectionObserver" in window && revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach(function (element) {
    element.classList.add("reveal-ready");
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach(function (element) {
    element.classList.add("revealed");
  });
}

/* ================================
   Keyboard Accessibility
================================ */

document.addEventListener("keydown", function (event) {
  if (event.key === "Tab") {
    document.body.classList.add("keyboard-user");
  }
});

document.addEventListener("mousedown", function () {
  document.body.classList.remove("keyboard-user");
});

/* ================================
   Console Confirmation
================================ */

console.log("Hearth & Grain Bakery website loaded successfully.");