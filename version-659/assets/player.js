(function () {
  var video = document.getElementById('moviePlayer');
  var start = document.querySelector('.start-layer');
  var box = document.querySelector('.player-box');
  var media = window.mediaUrl;
  var hls = null;
  var ready = false;

  function prepare() {
    if (!video || !media || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = media;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(media);
      hls.attachMedia(video);
    } else {
      video.src = media;
    }
  }

  function playVideo() {
    prepare();

    if (box) {
      box.classList.add('started');
    }

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  if (start) {
    start.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        playVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
