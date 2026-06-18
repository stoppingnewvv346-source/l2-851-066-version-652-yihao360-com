(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });

    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener('click', function () {
      showSlide(i);
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var searchInput = document.querySelector('[data-filter="keyword"]');
  var regionSelect = document.querySelector('[data-filter="region"]');
  var typeSelect = document.querySelector('[data-filter="type"]');
  var yearInput = document.querySelector('[data-filter="year"]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function getValue(el) {
    return el ? el.value.trim().toLowerCase() : '';
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = getValue(searchInput);
    var region = getValue(regionSelect);
    var type = getValue(typeSelect);
    var year = getValue(yearInput);

    cards.forEach(function (card) {
      var text = [
        card.dataset.title || '',
        card.dataset.region || '',
        card.dataset.type || '',
        card.dataset.year || '',
        card.dataset.genre || '',
        card.dataset.tags || ''
      ].join(' ').toLowerCase();

      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && (card.dataset.region || '').toLowerCase().indexOf(region) === -1) {
        matched = false;
      }

      if (type && (card.dataset.type || '').toLowerCase().indexOf(type) === -1) {
        matched = false;
      }

      if (year && String(card.dataset.year || '').indexOf(year) === -1) {
        matched = false;
      }

      card.classList.toggle('hide-card', !matched);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q && searchInput) {
    searchInput.value = q;
  }

  [searchInput, regionSelect, typeSelect, yearInput].forEach(function (el) {
    if (el) {
      el.addEventListener('input', filterCards);
      el.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();
