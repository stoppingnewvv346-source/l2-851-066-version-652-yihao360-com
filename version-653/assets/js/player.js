function setupMoviePlayer(options) {
  const video = document.getElementById(options.videoId);
  const overlay = document.getElementById(options.overlayId);
  const streamUrl = options.streamUrl;
  let ready = false;
  let hls = null;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function attachStream() {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        setTimeout(resolve, 1600);
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function startPlayback() {
    overlay.classList.add('is-hidden');
    attachStream().then(function () {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    });
  }

  overlay.addEventListener('click', startPlayback);

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
