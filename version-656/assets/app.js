(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = qs('[data-page-search]', panel);
      var buttons = qsa('[data-filter-value]', panel);
      var grid = qs('[data-card-grid]');
      var activeValue = '';

      function apply() {
        if (!grid) {
          return;
        }
        var query = input ? input.value.trim().toLowerCase() : '';
        qsa('[data-search-card]', grid).forEach(function (card) {
          var text = (card.getAttribute('data-search-text') || '').toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesValue = !activeValue || text.indexOf(activeValue.toLowerCase()) !== -1;
          card.hidden = !(matchesQuery && matchesValue);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
          apply();
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          activeValue = button.getAttribute('data-filter-value') || '';
          apply();
        });
      });
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('.play-layer', player);
      var stream = player.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;

      function bindStream() {
        if (started || !video || !stream) {
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = stream;
      }

      function play() {
        bindStream();
        if (button) {
          button.classList.add('is-hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (!video) {
        return;
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      video.addEventListener('error', function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
