(function () {
  const movies = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
  const params = new URLSearchParams(window.location.search);
  const input = document.querySelector('[data-search-page-input]');
  const form = document.querySelector('[data-search-page-form]');
  const results = document.querySelector('[data-search-results]');
  const title = document.querySelector('[data-search-title]');
  const meta = document.querySelector('[data-search-meta]');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card" data-card>',
      '<a href="' + escapeHtml(movie.url) + '" class="movie-card-link">',
      '<div class="poster-frame">',
      '<img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-hover">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function search(query) {
    const keyword = normalize(query);
    const picked = keyword
      ? movies.filter(function (movie) {
          const haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            (movie.tags || []).join(' '),
            movie.oneLine
          ].join(' '));
          return haystack.indexOf(keyword) !== -1;
        }).slice(0, 80)
      : movies.slice(0, 24);

    if (title) {
      title.textContent = keyword ? '搜索结果' : '推荐影片';
    }

    if (meta) {
      meta.textContent = keyword ? '关键词：' + query : '精选内容';
    }

    if (results) {
      results.innerHTML = picked.length
        ? picked.map(renderCard).join('')
        : '<div class="story-card"><h2>暂无匹配内容</h2><p>可以尝试更换影片名、地区、类型或年份继续搜索。</p></div>';
    }
  }

  const initial = params.get('q') || '';

  if (input) {
    input.value = initial;
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input ? input.value.trim() : '';
      const target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', target);
      search(query);
    });
  }

  search(initial);
})();
