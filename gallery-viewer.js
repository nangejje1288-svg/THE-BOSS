(() => {
    const grid = document.getElementById('photo-grid');
    const dialog = document.getElementById('photo-viewer');
    const image = document.getElementById('photo-viewer-image');
    const count = document.getElementById('photo-viewer-count');
    const title = document.getElementById('photo-viewer-title');
    const description = document.getElementById('photo-viewer-description');
    const closeButton = document.getElementById('photo-viewer-close');
    const previousButton = document.getElementById('photo-viewer-previous');
    const nextButton = document.getElementById('photo-viewer-next');
    if (!grid || !dialog || !image || !count || !title || !description || !closeButton || !previousButton || !nextButton) return;

    let currentIndex = 0;
    let opener;

    function visibleCards() {
        return [...grid.querySelectorAll('.archive-card')];
    }

    function showPhoto(index) {
        const cards = visibleCards();
        if (!cards.length) {
            dialog.close();
            return;
        }

        currentIndex = (index + cards.length) % cards.length;
        const card = cards[currentIndex];
        const cardImage = card.querySelector('.archive-photo img');
        if (!cardImage) {
            throw new Error('The selected gallery card is missing its photo.');
        }

        image.src = cardImage.currentSrc || cardImage.src;
        image.alt = cardImage.alt;
        title.textContent = card.querySelector('h3')?.textContent ?? 'Photo from Sharine’s archive';
        description.textContent = card.querySelector('figcaption p')?.textContent ?? '';
        count.textContent = `Photo ${currentIndex + 1} of ${cards.length}`;
        previousButton.disabled = cards.length < 2;
        nextButton.disabled = cards.length < 2;
    }

    function openPhoto(button) {
        const cards = visibleCards();
        const card = button.closest('.archive-card');
        const index = cards.indexOf(card);
        if (index < 0) return;

        opener = button;
        showPhoto(index);
        dialog.showModal();
        closeButton.focus();
    }

    grid.addEventListener('click', (event) => {
        const button = event.target.closest('.archive-photo-open');
        if (button && grid.contains(button)) openPhoto(button);
    });

    previousButton.addEventListener('click', () => showPhoto(currentIndex - 1));
    nextButton.addEventListener('click', () => showPhoto(currentIndex + 1));
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showPhoto(currentIndex - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            showPhoto(currentIndex + 1);
        }
    });
    dialog.addEventListener('close', () => {
        if (opener?.isConnected) opener.focus();
        opener = undefined;
    });

    window.addEventListener('sharine:gallery-rendered', () => {
        if (!dialog.open) return;
        const cards = visibleCards();
        const index = cards.findIndex((card) => card.querySelector('.archive-photo img')?.src === image.src);
        if (index < 0) {
            dialog.close();
            return;
        }
        showPhoto(index);
    });
})();
