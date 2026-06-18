(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");

    if (navButton && nav) {
      navButton.addEventListener("click", function () {
        var expanded = navButton.getAttribute("aria-expanded") === "true";
        navButton.setAttribute("aria-expanded", String(!expanded));
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.setAttribute("data-active", slideIndex === current ? "true" : "false");
        });
        dots.forEach(function (dot, dotIndex) {
          dot.setAttribute("data-active", dotIndex === current ? "true" : "false");
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var filterInput = document.querySelector("[data-card-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-item]"));
    var empty = document.querySelector("[data-filter-empty]");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }

      var keyword = normalize(filterInput ? filterInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute("data-year") === year;
        var matched = matchedKeyword && matchedYear;
        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
  });
})();
