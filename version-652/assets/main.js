(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var dotsWrap = hero.querySelector('[data-hero-dots]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第' + (index + 1) + '部');
        dot.addEventListener('click', function () {
          showSlide(index);
          startAuto();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startAuto();
      });
    }

    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    showSlide(0);
    startAuto();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function updateList(list, query, filters) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-item'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.type,
        card.dataset.year,
        card.dataset.region,
        card.dataset.tags
      ].join(' '));
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesType = !filters.type || filters.type === 'all' || card.dataset.type === filters.type;
      var matchesYear = !filters.year || filters.year === 'all' || card.dataset.year === filters.year;
      var show = matchesQuery && matchesType && matchesYear;

      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    var count = document.querySelector('[data-result-count]');
    if (count) {
      count.textContent = visible + ' 部影片';
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var activeFilters = { type: 'all', year: 'all' };

  searchInputs.forEach(function (input) {
    var target = document.getElementById(input.dataset.searchTarget);

    if (!target) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      updateList(target, normalize(input.value), activeFilters);
    }

    input.addEventListener('input', apply);
    apply();
  });

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.dataset.filterGroup;
      activeFilters[group] = button.dataset.filterValue;

      filterButtons
        .filter(function (item) {
          return item.dataset.filterGroup === group;
        })
        .forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });

      var input = document.querySelector('[data-search]');
      var target = input && document.getElementById(input.dataset.searchTarget);
      if (target) {
        updateList(target, normalize(input.value), activeFilters);
      }
    });
  });

  var player = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play-button]');
  var playerStatus = document.querySelector('[data-player-status]');
  var initialized = false;
  var hlsInstance = null;

  function setStatus(message) {
    if (playerStatus) {
      playerStatus.textContent = message;
    }
  }

  function startPlayer() {
    if (!player) {
      return;
    }

    var source = player.dataset.src;

    if (!source) {
      setStatus('当前播放源不可用');
      return;
    }

    if (playButton) {
      playButton.classList.add('is-hidden');
    }

    if (initialized) {
      player.play().catch(function () {
        setStatus('请再次点击视频区域继续播放');
      });
      return;
    }

    initialized = true;
    setStatus('正在加载播放源');

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(player);

      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已就绪');
        player.play().catch(function () {
          setStatus('点击视频区域开始播放');
        });
      });

      hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('播放加载失败，请刷新后重试');
        }
      });
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
      player.addEventListener('loadedmetadata', function () {
        setStatus('播放源已就绪');
        player.play().catch(function () {
          setStatus('点击视频区域开始播放');
        });
      }, { once: true });
    } else {
      setStatus('当前浏览器暂不支持 HLS 播放');
    }
  }

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.preventDefault();
      startPlayer();
    });
  }

  if (player) {
    player.addEventListener('click', function () {
      if (!initialized) {
        startPlayer();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
