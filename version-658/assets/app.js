(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var button = document.querySelector(".nav-toggle");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 6200);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    start();
  }

  function initSearchScopes() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
    scopes.forEach(function(scope) {
      var input = scope.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));
      var noResults = scope.querySelector("[data-no-results]");
      var filterButtons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var currentFilter = "";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function(card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var matchesText = !query || text.indexOf(query) !== -1;
          var matchesType = !currentFilter || type.indexOf(currentFilter) !== -1 || text.indexOf(currentFilter.toLowerCase()) !== -1;
          var show = matchesText && matchesType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (noResults) {
          noResults.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      filterButtons.forEach(function(button) {
        button.addEventListener("click", function() {
          currentFilter = button.getAttribute("data-filter-value") || "";
          filterButtons.forEach(function(item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
    });
  }

  ready(function() {
    initNavigation();
    initHero();
    initSearchScopes();
  });
}());
