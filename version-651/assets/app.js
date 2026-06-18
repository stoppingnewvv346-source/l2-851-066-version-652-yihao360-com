(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-hidden");
      }, { once: true });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function schedule() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }
    schedule();
  }

  function initFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var grid = document.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var keepQuery = !query || haystack.indexOf(query) !== -1;
          var keepRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var keepType = !typeValue || card.getAttribute("data-type") === typeValue;
          card.classList.toggle("is-filtered-out", !(keepQuery && keepRegion && keepType));
        });
      }

      [input, region, type].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card compact">',
      '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-glow"></span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var data = window.MOVIE_SEARCH_DATA || [];
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (!form || !input || !results) {
      return;
    }

    function render(query) {
      var q = query.trim().toLowerCase();
      if (title) {
        title.textContent = q ? "搜索结果" : "精选影片";
      }
      var list = q ? data.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(q) !== -1;
      }) : data.slice(0, 36);
      if (!list.length) {
        results.innerHTML = '<div class="empty-result">没有找到匹配影片</div>';
        return;
      }
      results.innerHTML = list.slice(0, 120).map(movieCard).join("");
      initImages();
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    render(initial);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "?q=" + encodeURIComponent(query) : window.location.pathname;
      window.history.replaceState(null, "", url);
      render(query);
    });
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
