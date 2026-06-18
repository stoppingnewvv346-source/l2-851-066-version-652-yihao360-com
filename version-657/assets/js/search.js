(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var input = document.querySelector("[data-search-page-input]");
    var form = document.querySelector("[data-search-page-form]");
    var list = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    var data = typeof MOVIE_SEARCH_DATA !== "undefined" ? MOVIE_SEARCH_DATA : [];

    if (input) {
      input.value = keyword;
    }

    function render(value) {
      var query = normalize(value);
      var matched = data.filter(function (item) {
        if (!query) {
          return item.featured;
        }

        return normalize([
          item.title,
          item.year,
          item.region,
          item.genre,
          item.type,
          item.tags
        ].join(" ")).indexOf(query) !== -1;
      }).slice(0, 120);

      if (list) {
        list.innerHTML = matched.map(function (item) {
          return "<a class=\"movie-card\" href=\"" + escapeHtml(item.url) + "\">" +
            "<span class=\"poster-wrap\">" +
            "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span>" +
            "<span class=\"region-badge\">" + escapeHtml(item.region) + "</span>" +
            "</span>" +
            "<span class=\"card-body\">" +
            "<strong>" + escapeHtml(item.title) + "</strong>" +
            "<span class=\"card-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.type) + "</span>" +
            "<span class=\"card-genre\">" + escapeHtml(item.genre) + "</span>" +
            "<span class=\"card-desc\">" + escapeHtml(item.line) + "</span>" +
            "<span class=\"card-tags\">" + escapeHtml(item.tags) + "</span>" +
            "</span>" +
            "</a>";
        }).join("");
      }

      if (empty) {
        empty.classList.toggle("is-visible", matched.length === 0);
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var nextQuery = input ? input.value : "";
        var url = new URL(window.location.href);
        url.searchParams.set("q", nextQuery);
        window.history.replaceState({}, "", url.toString());
        render(nextQuery);
      });
    }

    render(keyword);
  });
})();
