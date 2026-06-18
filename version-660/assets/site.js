(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var clearButton = panel.querySelector("[data-clear-filter]");
      var quickButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-quick-filter]"));
      var result = panel.querySelector("[data-filter-result]");
      var section = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));

      function applyFilter(value) {
        var keyword = String(value || "").trim().toLowerCase();
        var visibleCount = 0;

        cards.forEach(function (card) {
          var searchable = String(card.getAttribute("data-search") || "").toLowerCase();
          var matched = !keyword || searchable.indexOf(keyword) !== -1;

          card.classList.toggle("is-hidden", !matched);

          if (matched) {
            visibleCount += 1;
          }
        });

        if (result) {
          result.textContent = keyword ? "筛选结果：" + visibleCount + " 条" : "正在展示全部内容，共 " + cards.length + " 条";
        }
      }

      if (input) {
        input.addEventListener("input", function () {
          applyFilter(input.value);
        });
      }

      quickButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-quick-filter") || "";

          if (input) {
            input.value = value;
          }

          applyFilter(value);
        });
      });

      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }

          applyFilter("");
        });
      }

      applyFilter(input ? input.value : "");
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("video[data-m3u8]"));

    players.forEach(function (video) {
      var source = video.getAttribute("data-m3u8");
      var card = video.closest(".player-card");
      var button = card ? card.querySelector("[data-player-start]") : null;
      var status = card ? card.querySelector("[data-player-status]") : null;
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initializePlayer() {
        if (initialized) {
          video.play().catch(function () {});
          return;
        }

        if (!source) {
          setStatus("未找到播放源");
          return;
        }

        setStatus("正在加载...");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          initialized = true;
          video.play().catch(function () {
            setStatus("已加载，请再次点击播放");
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            initialized = true;
            video.play().catch(function () {
              setStatus("视频已准备好，请再次点击播放");
            });
          });

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("加载异常，请刷新后重试");
              hls.destroy();
            }
          });

          video._hls = hls;
          return;
        }

        setStatus("当前浏览器暂不支持播放");
      }

      if (button) {
        button.addEventListener("click", function () {
          button.classList.add("is-hidden");
          initializePlayer();
        });
      }

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }

        setStatus("正在播放");
      });

      video.addEventListener("pause", function () {
        setStatus("已暂停");
      });
    });
  }

  function initDetailShortcuts() {
    var shortcuts = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]"));

    shortcuts.forEach(function (shortcut) {
      shortcut.addEventListener("click", function (event) {
        var player = document.querySelector(".player-card");

        if (!player) {
          return;
        }

        event.preventDefault();
        player.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
    initDetailShortcuts();
  });
})();
