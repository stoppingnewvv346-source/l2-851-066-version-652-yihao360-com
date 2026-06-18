(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    window.markImageMissing = function (image) {
        var frame = image.closest('.poster-frame');
        if (frame) {
            frame.classList.add('is-missing');
        }
        image.remove();
    };

    qsa('img').forEach(function (image) {
        image.addEventListener('error', function () {
            window.markImageMissing(image);
        }, { once: true });
    });

    var menuButton = qs('[data-menu-toggle]');
    var mobileMenu = qs('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var backToTop = qs('[data-back-to-top]');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('is-visible', window.scrollY > 360);
        });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    qsa('[data-filter-panel]').forEach(function (panel) {
        var input = qs('[data-local-filter]', panel);
        var list = qs('[data-filter-list]') || panel.parentElement.querySelector('[data-filter-list]');
        var empty = qs('[data-empty-state]') || panel.parentElement.querySelector('[data-empty-state]');
        var quickButtons = qsa('[data-quick-filter]', panel);
        var activeQuick = '';

        function applyFilter() {
            if (!list) {
                return;
            }
            var query = ((input && input.value) || '').trim().toLowerCase();
            var quick = activeQuick.toLowerCase();
            var visible = 0;
            qsa('[data-filter-card]', list).forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category')
                ].join(' ').toLowerCase();
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesQuick = !quick || haystack.indexOf(quick) !== -1;
                var shouldShow = matchesQuery && matchesQuick;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        quickButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-quick-filter') || '';
                activeQuick = activeQuick === value ? '' : value;
                quickButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button && activeQuick === value);
                });
                applyFilter();
            });
        });
    });

    var searchApp = qs('[data-search-app]');
    if (searchApp && window.MOVIE_SEARCH_DATA) {
        var searchInput = qs('[data-search-input]', searchApp);
        var categorySelect = qs('[data-category-select]', searchApp);
        var regionSelect = qs('[data-region-select]', searchApp);
        var typeSelect = qs('[data-type-select]', searchApp);
        var resetButton = qs('[data-search-reset]', searchApp);
        var results = qs('[data-search-results]', searchApp);
        var summary = qs('[data-search-summary]', searchApp);
        var params = new URLSearchParams(window.location.search);

        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q');
        }

        function movieCard(movie) {
            return [
                '<article class="movie-card">',
                '<a href="' + movie.url + '" class="card-link" aria-label="' + escapeHtml(movie.title) + '">',
                '<span class="poster-frame" data-title="' + escapeHtml(movie.title) + '">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-overlay"></span>',
                '<span class="play-circle">▶</span>',
                '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
                '<span class="score-badge">' + escapeHtml(String(movie.score)) + '</span>',
                '</span>',
                '<span class="card-body">',
                '<strong>' + escapeHtml(movie.title) + '</strong>',
                '<span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.category) + '</span>',
                '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
                '</span>',
                '</a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function runSearch() {
            var query = (searchInput.value || '').trim().toLowerCase();
            var category = categorySelect.value;
            var region = regionSelect.value;
            var type = typeSelect.value;
            var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.category, movie.tags, movie.oneLine].join(' ').toLowerCase();
                return (!query || haystack.indexOf(query) !== -1)
                    && (!category || movie.category === category)
                    && (!region || movie.region === region)
                    && (!type || movie.type === type);
            });
            var limited = matches.slice(0, 120);
            results.innerHTML = limited.map(movieCard).join('');
            qsa('img', results).forEach(function (image) {
                image.addEventListener('error', function () {
                    window.markImageMissing(image);
                }, { once: true });
            });
            summary.textContent = '找到 ' + matches.length + ' 条结果' + (matches.length > limited.length ? '，当前显示前 ' + limited.length + ' 条' : '');
        }

        [searchInput, categorySelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runSearch);
                control.addEventListener('change', runSearch);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                searchInput.value = '';
                categorySelect.value = '';
                regionSelect.value = '';
                typeSelect.value = '';
                runSearch();
            });
        }

        runSearch();
    }
}());
