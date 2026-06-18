import { H as Hls } from './hls.js';

const activePlayers = new WeakMap();

function findElement(selector, root = document) {
    return root.querySelector(selector);
}

function showError(wrapper, message) {
    const error = findElement('[data-player-error]', wrapper);
    if (error) {
        error.hidden = false;
        error.textContent = message;
    }
}

function hideOverlay(wrapper) {
    const overlay = findElement('[data-play-overlay]', wrapper);
    if (overlay) {
        overlay.classList.add('is-hidden');
    }
}

function showOverlay(wrapper) {
    const overlay = findElement('[data-play-overlay]', wrapper);
    if (overlay) {
        overlay.classList.remove('is-hidden');
    }
}

function attachHls(video, source, wrapper) {
    if (activePlayers.has(video)) {
        return Promise.resolve();
    }

    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (_event, data) {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                showError(wrapper, '网络加载异常，正在尝试重新连接。');
                hls.startLoad();
                return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                showError(wrapper, '媒体解码异常，正在尝试恢复播放。');
                hls.recoverMediaError();
                return;
            }
            showError(wrapper, '当前播放源暂时无法播放，请稍后重试。');
        });
        activePlayers.set(video, hls);
        return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        activePlayers.set(video, true);
        return Promise.resolve();
    }

    showError(wrapper, '当前浏览器不支持 HLS 视频播放。');
    return Promise.reject(new Error('HLS is not supported'));
}

function initPlayer(wrapper) {
    const video = findElement('video[data-src]', wrapper);
    const overlay = findElement('[data-play-overlay]', wrapper);

    if (!video || !overlay) {
        return;
    }

    const source = video.dataset.src;

    async function playVideo() {
        try {
            await attachHls(video, source, wrapper);
            hideOverlay(wrapper);
            await video.play();
        } catch (error) {
            showOverlay(wrapper);
            if (!findElement('[data-player-error]', wrapper).textContent) {
                showError(wrapper, '播放启动失败，请再次点击或更换浏览器尝试。');
            }
        }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
        hideOverlay(wrapper);
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            showOverlay(wrapper);
        }
    });
    video.addEventListener('ended', function () {
        showOverlay(wrapper);
    });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);

window.addEventListener('beforeunload', function () {
    document.querySelectorAll('video[data-src]').forEach(function (video) {
        const player = activePlayers.get(video);
        if (player && typeof player.destroy === 'function') {
            player.destroy();
        }
    });
});
