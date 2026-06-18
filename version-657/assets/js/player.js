(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var streamUrl = options.streamUrl;
    var initialized = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback() {
      attachStream();

      if (button) {
        button.classList.add("is-hidden");
      }

      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (!initialized) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
