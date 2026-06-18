(function () {
  'use strict';

  function getRoot() {
    return document.body ? document.body.getAttribute('data-root') || './' : './';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) {
      return;
    }

    var updateHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    var button = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (button && mobileNav) {
      button.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
    var index = window.MOVIE_INDEX || [];
    var rootPath = getRoot();

    roots.forEach(function (root) {
      var input = root.querySelector('.js-global-search');
      var panel = root.querySelector('[data-search-suggestions]');
      if (!input || !panel) {
        return;
      }

      function render(query) {
        var q = normalize(query);
        if (!q) {
          panel.classList.remove('is-open');
          panel.innerHTML = '';
          return;
        }

        var results = index.filter(function (item) {
          return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags).indexOf(q) !== -1;
        }).slice(0, 8);

        if (!results.length) {
          panel.innerHTML = '<div class="search-empty">没有找到匹配影片，可进入搜索页扩大范围。</div>';
          panel.classList.add('is-open');
          return;
        }

        panel.innerHTML = results.map(function (item) {
          return [
            '<a class="search-suggestion-item" href="' + rootPath + item.url + '">',
            '  <img src="' + rootPath + item.cover + '" alt="' + escapeHtml(item.title) + '">',
            '  <span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</small></span>',
            '  <small>播放</small>',
            '</a>'
          ].join('');
        }).join('');
        panel.classList.add('is-open');
      }

      input.addEventListener('input', function () {
        render(input.value);
      });

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && input.value.trim()) {
          window.location.href = rootPath + 'search.html?q=' + encodeURIComponent(input.value.trim());
        }
      });

      document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) {
          panel.classList.remove('is-open');
        }
      });
    });
  }

  function initPageFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var list = document.querySelector('[data-movie-list]');
      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var input = panel.querySelector('.js-filter-input');
      var category = panel.querySelector('.js-category-filter');
      var sort = panel.querySelector('.js-sort-select');
      var counter = panel.querySelector('[data-visible-count]');
      var empty = document.querySelector('[data-empty-state]');

      function apply() {
        var q = normalize(input ? input.value : '');
        var categoryValue = category ? category.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matchText = !q || normalize(card.getAttribute('data-search')).indexOf(q) !== -1;
          var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
          var isVisible = matchText && matchCategory;
          card.style.display = isVisible ? '' : 'none';
          if (isVisible) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = '显示 ' + visible + ' 部';
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      function applySort() {
        if (!sort || sort.value === 'default') {
          apply();
          return;
        }

        var key = sort.value;
        cards.sort(function (a, b) {
          var av = Number(a.getAttribute('data-' + key)) || 0;
          var bv = Number(b.getAttribute('data-' + key)) || 0;
          return bv - av;
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
        apply();
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (category) {
        category.addEventListener('change', apply);
      }
      if (sort) {
        sort.addEventListener('change', applySort);
      }

      applySort();
    });
  }

  function initSearchPage() {
    var input = document.querySelector('.js-filter-input');
    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && !input.value) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initGlobalSearch();
    initPageFilters();
    initSearchPage();
  });
}());
