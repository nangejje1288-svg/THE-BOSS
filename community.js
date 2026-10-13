(() => {
    const config = window.SHARINE_SUPABASE_CONFIG || {};
    const isConfigured = typeof config.url === 'string'
        && config.url.startsWith('https://')
        && typeof config.anonKey === 'string'
        && !config.url.includes('YOUR_SUPABASE')
        && config.anonKey.length > 20
        && !config.anonKey.includes('YOUR_SUPABASE');
    const client = isConfigured && window.supabase
        ? window.supabase.createClient(config.url, config.anonKey)
        : null;
    const likeCounts = new Map();
    const commentCounts = new Map();
    const likeButtons = new Map();
    const likedPhotoIds = new Set();
    const authStatus = document.getElementById('community-auth-status');
    const adminStatus = document.getElementById('community-admin-status');
    const loginPanel = document.getElementById('community-login');
    const dashboard = document.getElementById('community-dashboard');
    let visitorId;
    let isAdmin = false;
    let communityReady = false;

    function setStatus(element, message, isError = false) {
        if (!element) return;
        element.textContent = message;
        element.classList.toggle('is-error', isError);
    }

    function setCommunityConnectionStatus(message, isError = false) {
        const status = document.getElementById('community-connection-status');
        if (!status) return;
        status.hidden = !message;
        setStatus(status, message, isError);
    }

    function dateLabel(value) {
        return new Date(value).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function refreshLikeButton(photoId) {
        const button = likeButtons.get(photoId);
        if (!button) return;
        const liked = button.dataset.liked === 'true';
        button.setAttribute('aria-pressed', String(liked));
        button.classList.toggle('is-liked', liked);
        button.querySelector('.like-count').textContent = String(likeCounts.get(photoId) || 0);
    }

    function addPhotoControls(card, photoId) {
        const community = document.createElement('section');
        community.className = 'photo-community';
        community.setAttribute('aria-label', 'Photo likes and comments');
        const actions = document.createElement('div');
        actions.className = 'photo-community-actions';
        const like = document.createElement('button');
        like.className = 'like-button';
        like.type = 'button';
        like.dataset.liked = 'false';
        like.setAttribute('aria-pressed', 'false');
        like.innerHTML = '<span class="community-action-label"><span aria-hidden="true">♡</span> Like</span><span class="like-count">0</span>';
        const commentsToggle = document.createElement('button');
        commentsToggle.className = 'comment-toggle';
        commentsToggle.type = 'button';
        commentsToggle.innerHTML = '<span class="community-action-label">Comments</span><span class="comment-count">0</span>';
        actions.append(like, commentsToggle);

        const panel = document.createElement('div');
        panel.className = 'comments-panel';
        panel.hidden = true;
        const list = document.createElement('div');
        list.className = 'comment-list';
        list.setAttribute('aria-live', 'polite');
        const form = document.createElement('form');
        form.className = 'community-form comment-form';
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Your name';
        const name = document.createElement('input');
        name.type = 'text';
        name.maxLength = 60;
        name.required = true;
        name.autocomplete = 'nickname';
        nameLabel.append(name);
        const commentLabel = document.createElement('label');
        commentLabel.textContent = 'Leave a kind comment';
        const comment = document.createElement('textarea');
        comment.rows = 3;
        comment.maxLength = 1200;
        comment.required = true;
        commentLabel.append(comment);
        const submit = document.createElement('button');
        submit.className = 'filter-button';
        submit.type = 'submit';
        submit.textContent = 'Post comment';
        const message = document.createElement('p');
        message.className = 'community-status';
        message.setAttribute('role', 'status');
        form.append(nameLabel, commentLabel, submit, message);
        panel.append(list, form);
        community.append(actions, panel);
        card.append(community);
        likeButtons.set(photoId, like);
        like.dataset.liked = String(likedPhotoIds.has(photoId));
        refreshLikeButton(photoId);
        commentsToggle.querySelector('.comment-count').textContent = String(commentCounts.get(photoId) || 0);
        like.addEventListener('click', () => toggleLike(photoId, like, message));
        commentsToggle.addEventListener('click', async () => {
            panel.hidden = !panel.hidden;
            if (!panel.hidden) {
                if (client) await loadComments(photoId, list, message);
                else setStatus(message, 'Comments will be available when the site is connected to Supabase.', true);
            }
        });
        form.addEventListener('submit', (event) => submitComment(event, photoId, name, comment, list, message));
        if (!client || !communityReady) {
            like.disabled = true;
        }
        if (!client) {
            submit.disabled = true;
        }
    }

    async function toggleLike(photoId, button, message) {
        if (!client) return;
        button.disabled = true;
        const liked = button.dataset.liked === 'true';
        const result = liked
            ? await client.from('photo_likes').delete().eq('photo_id', photoId).eq('visitor_id', visitorId)
            : await client.from('photo_likes').insert({ photo_id: photoId, visitor_id: visitorId });
        button.disabled = false;
        if (result.error) {
            setStatus(message, `Your like could not be saved: ${result.error.message}`, true);
            return;
        }
        button.dataset.liked = String(!liked);
        if (liked) likedPhotoIds.delete(photoId);
        else likedPhotoIds.add(photoId);
        likeCounts.set(photoId, Math.max(0, (likeCounts.get(photoId) || 0) + (liked ? -1 : 1)));
        refreshLikeButton(photoId);
        setStatus(message, liked ? 'Your like was removed.' : 'Thanks for the kind support.');
    }

    async function loadComments(photoId, list, message) {
        if (!client || list.dataset.loaded === 'true') return;
        list.dataset.loaded = 'loading';
        const { data, error } = await client.from('photo_comments')
            .select('id, display_name, body, created_at')
            .eq('photo_id', photoId)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) {
            list.dataset.loaded = 'false';
            setStatus(message, `Comments could not be loaded: ${error.message}`, true);
            return;
        }
        list.replaceChildren();
        data.forEach((record) => list.append(createComment(record)));
        list.dataset.loaded = 'true';
    }

    function createComment(record) {
        const item = document.createElement('article');
        item.className = 'photo-comment';
        const heading = document.createElement('p');
        heading.className = 'photo-comment-byline';
        const author = document.createElement('strong');
        author.textContent = record.display_name;
        const date = document.createElement('time');
        date.dateTime = record.created_at;
        date.textContent = dateLabel(record.created_at);
        heading.append(author, date);
        const body = document.createElement('p');
        body.textContent = record.body;
        item.append(heading, body);
        return item;
    }

    async function submitComment(event, photoId, name, comment, list, message) {
        event.preventDefault();
        if (!client) {
            setStatus(message, 'Your comment cannot be posted until the site is connected to Supabase.', true);
            return;
        }
        const displayName = name.value.trim();
        const body = comment.value.trim();
        if (!displayName || !body) return;
        const submit = event.submitter;
        submit.disabled = true;
        const { data, error } = await client.from('photo_comments')
            .insert({ photo_id: photoId, display_name: displayName, body })
            .select('id, display_name, body, created_at')
            .single();
        submit.disabled = false;
        if (error) {
            setStatus(message, `Your comment could not be posted: ${error.message}`, true);
            return;
        }
        list.prepend(createComment(data));
        comment.value = '';
        commentCounts.set(photoId, (commentCounts.get(photoId) || 0) + 1);
        const counter = event.currentTarget.parentElement.parentElement.querySelector('.comment-count');
        if (counter) counter.textContent = String(commentCounts.get(photoId));
        list.dataset.loaded = 'true';
        setStatus(message, 'Your comment has been shared.');
    }

    async function loadCounters() {
        const [{ data: likes, error: likesError }, { data: comments, error: commentsError }] = await Promise.all([
            client.from('photo_likes').select('photo_id'),
            client.from('photo_comments').select('photo_id')
        ]);
        if (likesError || commentsError) {
            setStatus(document.getElementById('gallery-status'), 'The community totals could not be loaded. Check the Supabase table policies and connection.', true);
            return;
        }
        likes.forEach(({ photo_id: photoId }) => likeCounts.set(photoId, (likeCounts.get(photoId) || 0) + 1));
        comments.forEach(({ photo_id: photoId }) => commentCounts.set(photoId, (commentCounts.get(photoId) || 0) + 1));
        likeButtons.forEach((button, photoId) => refreshLikeButton(photoId));
        document.querySelectorAll('.archive-card').forEach((card) => {
            const photoId = card.dataset.photoId;
            const counter = card.querySelector('.comment-count');
            if (counter) counter.textContent = String(commentCounts.get(photoId) || 0);
        });
        const likedRows = await client.from('photo_likes').select('photo_id').eq('visitor_id', visitorId);
        if (likedRows.error) {
            setStatus(document.getElementById('gallery-status'), 'Your saved likes could not be checked. Please try again.', true);
            return;
        }
        likedRows.data.forEach(({ photo_id: photoId }) => {
            likedPhotoIds.add(photoId);
            const button = likeButtons.get(photoId);
            if (button) button.dataset.liked = 'true';
            refreshLikeButton(photoId);
        });
    }

    async function loadPublishedPhotos() {
        const { data, error } = await client.from('published_photos')
            .select('id, title, description, image_url, storage_path, created_at')
            .order('created_at', { ascending: false });
        if (error) {
            setStatus(document.getElementById('gallery-status'), `New photos could not be loaded: ${error.message}`, true);
            return;
        }
        renderAdminPhotos(data);
        window.dispatchEvent(new CustomEvent('sharine:photos-ready', { detail: data }));
    }

    function renderAdminPhotos(photos) {
        const list = document.getElementById('admin-photo-list');
        if (!list) return;
        list.replaceChildren();
        if (photos.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'admin-photo-empty';
            empty.textContent = 'You haven’t added any photos here yet.';
            list.append(empty);
            return;
        }
        photos.forEach((photo) => {
            const item = document.createElement('div');
            item.className = 'admin-photo-item';
            const title = document.createElement('span');
            title.textContent = photo.title;
            const remove = document.createElement('button');
            remove.className = 'admin-photo-delete';
            remove.type = 'button';
            remove.textContent = 'Delete';
            remove.setAttribute('aria-label', `Delete uploaded photo: ${photo.title}`);
            remove.addEventListener('click', () => deletePublishedPhoto(photo, remove));
            item.append(title, remove);
            list.append(item);
        });
    }

    async function deletePublishedPhoto(photo, button) {
        if (!isAdmin || !window.confirm(`Delete “${photo.title}” from the gallery? This cannot be undone.`)) return;
        button.disabled = true;
        const { data, error } = await client.from('published_photos')
            .delete()
            .eq('id', photo.id)
            .select('id')
            .maybeSingle();
        if (error) {
            button.disabled = false;
            setStatus(adminStatus, `The photo could not be deleted: ${error.message}`, true);
            return;
        }
        if (!data) {
            button.disabled = false;
            setStatus(adminStatus, 'The photo was not removed. Confirm you are signed in with Sharine’s admin account.', true);
            return;
        }
        window.dispatchEvent(new CustomEvent('sharine:photo-deleted', { detail: { id: photo.id } }));
        const { error: storageError } = await client.storage.from('sharine-gallery').remove([photo.storage_path]);
        await loadPublishedPhotos();
        if (storageError) {
            setStatus(adminStatus, `The photo was removed from the gallery, but its stored image needs cleanup: ${storageError.message}`, true);
            return;
        }
        setStatus(adminStatus, 'The uploaded photo was deleted from the gallery.');
    }

    async function loadLatestNote() {
        const { data, error } = await client.from('viewer_messages')
            .select('body, created_at')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            setStatus(document.getElementById('gallery-status'), `Sharine's latest note could not be loaded: ${error.message}`, true);
            return;
        }
        if (!data) return;
        const note = document.getElementById('sharine-viewer-note');
        if (!note) return;
        document.getElementById('sharine-viewer-note-title').textContent = 'A little hello from Sharine';
        document.getElementById('sharine-viewer-note-body').textContent = data.body;
        document.getElementById('sharine-viewer-note-date').textContent = dateLabel(data.created_at);
        note.hidden = false;
    }

    async function checkAdmin(session) {
        if (!session) {
            isAdmin = false;
            if (loginPanel) loginPanel.hidden = false;
            if (dashboard) dashboard.hidden = true;
            return;
        }
        const { data, error } = await client.from('admin_users')
            .select('user_id')
            .eq('user_id', session.user.id)
            .maybeSingle();
        if (error) {
            setStatus(authStatus, `Admin access could not be verified: ${error.message}`, true);
            return;
        }
        isAdmin = Boolean(data);
        if (!isAdmin) {
            await client.auth.signOut();
            setStatus(authStatus, 'This account has not been approved for Sharine’s admin access.', true);
            return;
        }
        if (loginPanel) loginPanel.hidden = true;
        if (dashboard) dashboard.hidden = false;
        document.querySelector('.community-disclosure')?.setAttribute('open', '');
        await loadPublishedPhotos();
        window.dispatchEvent(new CustomEvent('sharine:admin-state', { detail: { isAdmin: true } }));
    }

    async function connect() {
        if (!client) {
            setStatus(authStatus, 'Studio setup is incomplete: add the Supabase publishable key in supabase-config.js and run supabase-setup.sql. Then Sharine can sign in to post photos and notes.', true);
            setCommunityConnectionStatus('Likes and comments are shown below each photo, but they are not connected yet. Add the Supabase publishable key and apply supabase-setup.sql to enable shared interactions.', true);
            return;
        }
        setCommunityConnectionStatus('Connecting likes and comments…');
        let { data: { session } } = await client.auth.getSession();
        if (!session) {
            const { data, error } = await client.auth.signInAnonymously();
            if (error) {
                setStatus(document.getElementById('gallery-status'), `Community access could not start: ${error.message}`, true);
                setCommunityConnectionStatus(`Likes and comments could not connect: ${error.message}`, true);
                return;
            }
            session = data.session;
        }
        visitorId = session.user.id;
        communityReady = true;
        likeButtons.forEach((button) => { button.disabled = false; });
        await Promise.all([loadCounters(), loadPublishedPhotos(), loadLatestNote()]);
        await checkAdmin(session);
        setCommunityConnectionStatus('Likes and comments are ready. Share a kind response on any photo.');
        client.auth.onAuthStateChange((_event, sessionState) => {
            setTimeout(async () => {
                if (!sessionState) {
                    visitorId = undefined;
                    communityReady = false;
                    await checkAdmin(null);
                    likeButtons.forEach((button) => { button.disabled = true; });
                    const { data, error } = await client.auth.signInAnonymously();
                    if (error) {
                        setStatus(document.getElementById('gallery-status'), `Community access could not restart: ${error.message}`, true);
                        return;
                    }
                    visitorId = data.session.user.id;
                    communityReady = true;
                    likeButtons.forEach((button) => { button.disabled = false; });
                    return;
                }
                visitorId = sessionState.user.id;
                await checkAdmin(sessionState);
            }, 0);
        });
    }

    function setupForms() {
        document.getElementById('admin-login-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!client) return;
            const form = event.currentTarget;
            const submit = form.querySelector('button[type="submit"]');
            submit.disabled = true;
            const { data, error } = await client.auth.signInWithPassword({
                email: form.elements.email.value.trim(),
                password: form.elements.password.value
            });
            submit.disabled = false;
            if (error) {
                setStatus(authStatus, `Sign-in failed: ${error.message}`, true);
                return;
            }
            await checkAdmin(data.session);
            form.reset();
        });

        document.getElementById('admin-logout')?.addEventListener('click', async () => {
            const { error } = await client.auth.signOut();
            if (error) setStatus(adminStatus, `Sign-out failed: ${error.message}`, true);
            else setStatus(authStatus, 'You are signed out.');
        });

        document.getElementById('message-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!client || !isAdmin) return;
            const form = event.currentTarget;
            const submit = form.querySelector('button[type="submit"]');
            submit.disabled = true;
            const { error } = await client.from('viewer_messages').insert({ body: form.elements.message.value.trim() });
            submit.disabled = false;
            if (error) {
                setStatus(adminStatus, `Your note could not be published: ${error.message}`, true);
                return;
            }
            form.reset();
            setStatus(adminStatus, 'Your note is now visible to visitors.');
            await loadLatestNote();
        });

        document.getElementById('photo-upload-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!client || !isAdmin) return;
            const form = event.currentTarget;
            const file = form.elements.photo.files[0];
            if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
                setStatus(adminStatus, 'Choose a JPG, PNG or WEBP image no larger than 10 MB.', true);
                return;
            }
            const submit = form.querySelector('button[type="submit"]');
            submit.disabled = true;
            const extension = file.name.split('.').pop().toLowerCase();
            const path = `${crypto.randomUUID()}.${extension}`;
            const upload = await client.storage.from('sharine-gallery').upload(path, file, {
                cacheControl: '3600',
                contentType: file.type,
                upsert: false
            });
            if (upload.error) {
                submit.disabled = false;
                setStatus(adminStatus, `Photo upload failed: ${upload.error.message}`, true);
                return;
            }
            const { data: { publicUrl } } = client.storage.from('sharine-gallery').getPublicUrl(path);
            const { error } = await client.from('published_photos').insert({
                title: form.elements.title.value.trim(),
                description: form.elements.description.value.trim(),
                image_url: publicUrl,
                storage_path: path
            });
            submit.disabled = false;
            if (error) {
                const cleanup = await client.storage.from('sharine-gallery').remove([path]);
                const cleanupNote = cleanup.error ? ` The uploaded file also needs manual removal: ${cleanup.error.message}` : '';
                setStatus(adminStatus, `The photo record could not be saved: ${error.message}.${cleanupNote}`, true);
                return;
            }
            form.reset();
            setStatus(adminStatus, 'Your photo is now part of the gallery.');
            await loadPublishedPhotos();
        });
    }

    window.sharineCommunity = { addPhotoControls };
    setupForms();
    function openStudioFromHash() {
        if (window.location.hash !== '#sharine-studio') return;
        const disclosure = document.querySelector('.community-disclosure');
        if (disclosure) {
            disclosure.open = true;
            requestAnimationFrame(() => document.getElementById('sharine-studio')?.scrollIntoView());
        }
    }
    openStudioFromHash();
    window.addEventListener('hashchange', openStudioFromHash);
    connect();
})();
