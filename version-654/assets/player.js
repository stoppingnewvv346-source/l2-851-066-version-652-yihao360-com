(function () {
  'use strict';

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function attachSource(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return;
      }
      video.src = source;
    }).catch(function () {
      video.src = source;
    });
  }

  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-overlay]');
    var source = shell.getAttribute('data-src');
    var started = false;

    if (!video || !overlay || !source) {
      return;
    }

    function start() {
      if (started) {
        video.play();
        return;
      }

      started = true;
      overlay.setAttribute('disabled', 'disabled');
      overlay.querySelector('span').textContent = '加载中';

      attachSource(video, source).then(function () {
        shell.classList.add('is-playing');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('is-playing');
            overlay.removeAttribute('disabled');
            overlay.querySelector('span').textContent = '▶';
          });
        }
      });
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
}());
