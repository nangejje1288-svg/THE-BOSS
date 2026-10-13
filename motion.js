(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealSelector = 'main > section:not(.archive-section), .intro-copy, .intro-image, .chapter-card, .support-card, .archive-card, .gallery-ending-inner, .community-admin, .viewer-note';
    const revealObserver = reducedMotion.matches ? null : new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

    function observeReveals(root = document) {
        if (!revealObserver) return;
        if (root.matches?.(revealSelector)) {
            revealObserver.observe(root);
        }
        root.querySelectorAll?.(revealSelector).forEach((element) => revealObserver.observe(element));
    }

    document.documentElement.classList.add('motion-ready');
    observeReveals();
    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) observeReveals(node);
        }));
    }).observe(document.body, { childList: true, subtree: true });

    const grid = document.getElementById('photo-grid');
    const playButton = document.getElementById('photo-play');
    if (!grid || !playButton) return;

    const previousButton = document.getElementById('photo-previous');
    const nextButton = document.getElementById('photo-next');
    const progress = document.querySelector('.tour-progress-track');
    const progressFill = document.querySelector('.tour-progress-fill');
    const status = document.getElementById('tour-status');
    const intervalMs = 6000;
    let timer;
    let currentIndex = 0;
    let cards = [];
    let isPlaying = false;

    function visibleCards() {
        return [...grid.querySelectorAll('.archive-card')];
    }

    function updateProgress(index = currentIndex) {
        const amount = cards.length ? ((index + 1) / cards.length) * 100 : 0;
        progress.setAttribute('aria-valuenow', String(Math.round(amount)));
        progressFill.style.width = `${amount}%`;
        currentIndex = Math.min(Math.max(index, 0), Math.max(cards.length - 1, 0));
    }

    function announce(message) {
        status.textContent = message;
    }

    function goTo(index) {
        cards = visibleCards();
        if (!cards.length) {
            currentIndex = 0;
            updateProgress(0);
            return;
        }
        cards.forEach((card) => card.classList.remove('is-tour-current'));
        currentIndex = Math.min(Math.max(index, 0), cards.length - 1);
        cards[currentIndex].classList.add('is-tour-current');
        cards[currentIndex].scrollIntoView({
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
            block: 'start'
        });
        updateProgress(currentIndex);
        announce(isPlaying ? 'Auto-scroll is on · enjoying the photo collection.' : 'Browsing at your own pace.');
    }

    function nearestCardIndex() {
        cards = visibleCards();
        if (!cards.length) return 0;
        const target = window.innerHeight * 0.35;
        let nearest = 0;
        let nearestDistance = Infinity;
        cards.forEach((card, index) => {
            const distance = Math.abs(card.getBoundingClientRect().top - target);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = index;
            }
        });
        return nearest;
    }

    function stopAutoScroll(message = 'Auto-scroll paused.') {
        window.clearInterval(timer);
        timer = undefined;
        isPlaying = false;
        playButton.setAttribute('aria-pressed', 'false');
        playButton.querySelector('.tour-play-icon').textContent = '▶';
        playButton.querySelector('.tour-play-label').textContent = 'Start auto-scroll';
        announce(message);
    }

    function advance() {
        cards = visibleCards();
        if (currentIndex >= cards.length - 1) {
            stopAutoScroll('You have reached the end of this gallery view.');
            return;
        }
        goTo(currentIndex + 1);
    }

    function startAutoScroll() {
        cards = visibleCards();
        if (!cards.length) {
            announce('There are no photos in this view to scroll through.');
            return;
        }
        currentIndex = nearestCardIndex();
        grid.classList.add('is-guided');
        isPlaying = true;
        playButton.setAttribute('aria-pressed', 'true');
        playButton.querySelector('.tour-play-icon').textContent = 'Ⅱ';
        playButton.querySelector('.tour-play-label').textContent = 'Pause auto-scroll';
        goTo(currentIndex);
        timer = window.setInterval(advance, intervalMs);
    }

    function refreshGallery() {
        cards = visibleCards();
        grid.classList.remove('is-guided');
        cards.forEach((card) => card.classList.remove('is-tour-current'));
        currentIndex = 0;
        updateProgress(0);
        if (isPlaying) {
            stopAutoScroll('Gallery updated. Start auto-scroll when you are ready.');
        }
        previousButton.disabled = cards.length < 2;
        nextButton.disabled = cards.length < 2;
        playButton.disabled = cards.length === 0;
    }

    playButton.addEventListener('click', () => {
        if (isPlaying) stopAutoScroll();
        else startAutoScroll();
    });
    previousButton.addEventListener('click', () => {
        const target = currentIndex - 1;
        grid.classList.add('is-guided');
        stopAutoScroll('Auto-scroll paused. Use the arrows to browse.');
        goTo(target);
    });
    nextButton.addEventListener('click', () => {
        const target = currentIndex + 1;
        grid.classList.add('is-guided');
        stopAutoScroll('Auto-scroll paused. Use the arrows to browse.');
        goTo(target);
    });
    let scrollFrame;
    window.addEventListener('scroll', () => {
        if (isPlaying || scrollFrame) return;
        scrollFrame = window.requestAnimationFrame(() => {
            scrollFrame = undefined;
            cards = visibleCards();
            if (!cards.length) return;
            currentIndex = nearestCardIndex();
            updateProgress(currentIndex);
        });
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) stopAutoScroll('Auto-scroll paused while this page is in the background.');
    });
    window.addEventListener('sharine:gallery-rendered', refreshGallery);
    refreshGallery();
})();
