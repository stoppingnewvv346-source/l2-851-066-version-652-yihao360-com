(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  Array.from(document.querySelectorAll('.site-search')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      const query = input.value.trim();
      if (!query) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  const filterInput = document.querySelector('[data-filter-input]');
  const filterRegion = document.querySelector('[data-filter-region]');
  const filterType = document.querySelector('[data-filter-type]');
  const filterYear = document.querySelector('[data-filter-year]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    const keyword = normalize(filterInput ? filterInput.value : '');
    const region = normalize(filterRegion ? filterRegion.value : '');
    const type = normalize(filterType ? filterType.value : '');
    const year = normalize(filterYear ? filterYear.value : '');

    cards.forEach(function (card) {
      const text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
      const okKeyword = !keyword || text.indexOf(keyword) !== -1;
      const okRegion = !region || normalize(card.getAttribute('data-region')) === region;
      const okType = !type || normalize(card.getAttribute('data-type')) === type;
      const okYear = !year || normalize(card.getAttribute('data-year')) === year;
      card.classList.toggle('is-hidden', !(okKeyword && okRegion && okType && okYear));
    });
  }

  [filterInput, filterRegion, filterType, filterYear].forEach(function (node) {
    if (node) {
      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    }
  });

  const backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('show', window.scrollY > 500);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
})();
