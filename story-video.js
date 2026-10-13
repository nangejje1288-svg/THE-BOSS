(() => {
    const player = document.querySelector('.film-player');
    const screen = player?.querySelector('.film-screen');
    const scenes = [...(player?.querySelectorAll('[data-film-scene]') ?? [])];
    const playButton = document.getElementById('film-play');
    const replayButton = document.getElementById('film-replay');
    const status = document.getElementById('film-status');
    const progress = document.getElementById('film-progress');
    const progressBar = player?.querySelector('.film-progress');
    if (!player || !screen || !scenes.length || !playButton || !replayButton || !status || !progress || !progressBar) return;

    const sceneDuration = 8000;
    const totalDuration = scenes.length * sceneDuration;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let elapsed = 0;
    let startedAt = 0;
    let timer;
    let isPlaying = false;
    let hasAutoPlayed = false;
    let pausedByVisibility = false;

    function setScene(index) {
        scenes.forEach((scene, sceneIndex) => {
            const active = sceneIndex === index;
            scene.classList.toggle('is-active', active);
            scene.setAttribute('aria-hidden', String(!active));
        });
        status.textContent = `Scene ${index + 1} of ${scenes.length}`;
    }

    function updateProgress() {
        const percent = Math.min((elapsed / totalDuration) * 100, 100);
        progress.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', String(Math.round(percent)));
    }

    function pause(message = 'Story paused') {
        if (!isPlaying) return;
        elapsed += performance.now() - startedAt;
        window.clearInterval(timer);
        timer = undefined;
        isPlaying = false;
        updateProgress();
        playButton.innerHTML = '▶ <span>Continue</span>';
        playButton.setAttribute('aria-label', 'Continue story');
        status.textContent = message;
    }

    function play() {
        if (elapsed >= totalDuration) elapsed = 0;
        isPlaying = true;
        startedAt = performance.now();
        replayButton.disabled = false;
        playButton.innerHTML = 'Ⅱ <span>Pause</span>';
        playButton.setAttribute('aria-label', 'Pause story');
        setScene(Math.min(Math.floor(elapsed / sceneDuration), scenes.length - 1));
        updateProgress();
        timer = window.setInterval(() => {
            elapsed += performance.now() - startedAt;
            startedAt = performance.now();
            if (elapsed >= totalDuration) elapsed %= totalDuration;
            const sceneIndex = Math.floor(elapsed / sceneDuration);
            if (!scenes[sceneIndex].classList.contains('is-active')) setScene(sceneIndex);
            updateProgress();
        }, 100);
    }

    function replay() {
        window.clearInterval(timer);
        timer = undefined;
        isPlaying = false;
        elapsed = 0;
        setScene(0);
        updateProgress();
        play();
    }

    playButton.addEventListener('click', () => {
        pausedByVisibility = false;
        if (isPlaying) pause();
        else play();
    });
    replayButton.addEventListener('click', replay);

    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            if (!hasAutoPlayed && !reducedMotion.matches) {
                hasAutoPlayed = true;
                play();
            } else if (pausedByVisibility) {
                pausedByVisibility = false;
                play();
            }
            return;
        }
        if (isPlaying) {
            pausedByVisibility = true;
            pause('Paused while you browse');
        }
    }, { threshold: 0.45 }).observe(screen);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) pause('Paused while this page is in the background');
    });
    reducedMotion.addEventListener('change', (event) => {
        if (event.matches && isPlaying) pause('Paused · reduced motion is enabled');
    });
})();
