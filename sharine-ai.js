(() => {
    const config = window.SHARINE_SUPABASE_CONFIG || {};
    const projectUrl = typeof config.url === 'string'
        && config.url.startsWith('https://')
        && !config.url.includes('YOUR_SUPABASE')
        ? config.url.replace(/\/$/, '')
        : '';
    const endpoint = typeof config.aiFunctionUrl === 'string'
        && config.aiFunctionUrl.startsWith('https://')
        && !config.aiFunctionUrl.includes('YOUR_SUPABASE')
        ? config.aiFunctionUrl
        : projectUrl ? `${projectUrl}/functions/v1/sharine-ai` : '';
    const hasPublicKey = typeof config.anonKey === 'string'
        && config.anonKey.length > 20
        && !config.anonKey.includes('YOUR_SUPABASE');
    const connected = Boolean(endpoint);

    const launcher = document.createElement('button');
    launcher.className = 'sharine-ai-launcher';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open Sharine AI chat');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'sharine-ai-panel');
    launcher.innerHTML = '<span class="sharine-ai-launcher-mark" aria-hidden="true">S</span><span>Ask Sharine AI</span><span class="sharine-ai-spark" aria-hidden="true">✳</span>';

    const panel = document.createElement('section');
    panel.className = 'sharine-ai-panel';
    panel.id = 'sharine-ai-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'sharine-ai-title');
    panel.hidden = true;
    panel.innerHTML = `
        <header class="sharine-ai-header">
            <span class="sharine-ai-avatar" aria-hidden="true">S<span>✳</span></span>
            <div class="sharine-ai-heading">
                <h2 id="sharine-ai-title">Sharine AI</h2>
                <p>A friendly guide for curious fans</p>
            </div>
            <button class="sharine-ai-close" type="button" aria-label="Close Sharine AI chat">×</button>
        </header>
        <div class="sharine-ai-messages" id="sharine-ai-messages" role="log" aria-live="polite" aria-relevant="additions text">
            <article class="sharine-ai-message assistant">
                <p>Hi, I’m Sharine AI—an AI guide, not Sharine herself. Ask me about the stories, the website, or something else on your mind. I’ll be clear when I don’t know a personal detail.</p>
            </article>
        </div>
        <p class="sharine-ai-connection" id="sharine-ai-connection"></p>
        <form class="sharine-ai-form" id="sharine-ai-form">
            <label class="visually-hidden" for="sharine-ai-input">Ask Sharine AI a question</label>
            <textarea id="sharine-ai-input" name="question" rows="2" maxlength="1200" placeholder="Ask any question…" required></textarea>
            <button class="sharine-ai-send" type="submit" aria-label="Send message"><span aria-hidden="true">↑</span></button>
        </form>
        <p class="sharine-ai-footnote">AI can make mistakes. Please don’t share private information.</p>
    `;
    document.body.append(launcher, panel);

    const form = panel.querySelector('#sharine-ai-form');
    const input = panel.querySelector('#sharine-ai-input');
    const messagesElement = panel.querySelector('#sharine-ai-messages');
    const connectionMessage = panel.querySelector('#sharine-ai-connection');
    const closeButton = panel.querySelector('.sharine-ai-close');
    const conversation = [];
    let pending = false;

    function addMessage(role, message) {
        const article = document.createElement('article');
        article.className = `sharine-ai-message ${role}`;
        const paragraph = document.createElement('p');
        paragraph.textContent = message;
        article.append(paragraph);
        messagesElement.append(article);
        messagesElement.scrollTop = messagesElement.scrollHeight;
        return article;
    }

    function setConnectionMessage(message, isError = false) {
        connectionMessage.textContent = message;
        connectionMessage.classList.toggle('is-error', isError);
    }

    function setOpen(isOpen) {
        panel.hidden = !isOpen;
        launcher.setAttribute('aria-expanded', String(isOpen));
        launcher.setAttribute('aria-label', isOpen ? 'Close Sharine AI chat' : 'Open Sharine AI chat');
        launcher.classList.toggle('is-open', isOpen);
        if (isOpen) input.focus();
        else launcher.focus();
    }

    function answerFromPublishedSite(question) {
        const text = question.toLowerCase();
        if (/\b(hello|hi|hey|good morning|good evening)\b/.test(text)) {
            return 'Hello! I can help you find your way around Sharine’s website and share what the published stories are about. What would you like to know?';
        }
        if (/\b(who is sharine|about sharine|tell me about sharine|how old|age|school|s4|senior four|family)\b/.test(text)) {
            return 'The biography says Sharine is 18, currently studying in Senior Four (S4), and grew up in a well-off family. It does not provide her school name, location, relatives’ names, or other private details.';
        }
        if (/\b(slow switch|wellness|mindset|morning|peace)\b/.test(text)) {
            return '“The Slow Switch” is an editorial first-person draft about making quiet time, setting boundaries around mornings, and staying ambitious without constant hurry. Sharine should confirm that the scenes and routines reflect her real memories.';
        }
        if (/\b(digital window|internet|technology|tech|computer|laptop|online)\b/.test(text)) {
            return '“The Digital Window” is an editorial draft about using technology to explore ideas, learn skills, and create opportunities. Its personal scenes are a draft for Sharine to confirm, not verified facts.';
        }
        if (/\b(golden hour|ambition|growth|goals|setback|challenge)\b/.test(text)) {
            return '“The Golden Hour Reflection” is a draft about reflecting on daily progress, learning from setbacks, and approaching goals with intention.';
        }
        if (/\b(high.value circle|friend|friends|self.worth|connection|belong)\b/.test(text)) {
            return '“The High-Value Circle” is a draft about self-respect, choosing supportive friendships, and building connections with kindness and mutual respect.';
        }
        if (/\b(investing in the unseen|self.education|skill|skills|learning|financial confidence)\b/.test(text)) {
            return '“Investing in the Unseen” is a draft about self-education, patience, skill-building, and growing confidence for the future.';
        }
        if (/\b(imposter code|imposter|self.doubt|confidence|belong)\b/.test(text)) {
            return '“The Imposter Code” is a draft about meeting self-doubt with patience, curiosity, and the willingness to keep learning.';
        }
        if (/\b(graceful no|say no|boundar(y|ies)|distraction|priorit)\b/.test(text)) {
            return '“The Graceful No” is a draft about setting kind, clear boundaries to protect time for wellbeing, study, and future goals.';
        }
        if (/\b(stories|chapters|memoir|read|story page)\b/.test(text)) {
            return 'Visit the Stories page for the featured first-person drafts and ten chapter themes. The drafts cover wellness, technology, ambition, friendships, learning, self-doubt, and boundaries; Sharine should review them before they are treated as verified memories.';
        }
        if (/\b(gallery|photo|photos|picture|pictures|like|comment)\b/.test(text)) {
            return 'The Gallery page holds Sharine’s photo archive, with captions and photo-tour controls. Visitors can like or comment once the site’s Supabase project is configured.';
        }
        if (/\b(support|supporta|encourage|help)\b/.test(text)) {
            return 'The Supporta page shares respectful ways to encourage Sharine, including listening, supporting her studies if she wants help, and respecting her privacy and choices.';
        }
        if (/\b(ai|artificial intelligence|chatbot|connected|answer questions)\b/.test(text)) {
            return 'I’m Sharine AI, an AI guide—not Sharine herself. The website can currently answer questions about its published biography and stories. Open-ended AI answers require the site owner to connect a Supabase project and configure the AI provider key securely.';
        }
        return 'I can answer questions about the details published on this website, but I cannot give a reliable answer to that general question until the live AI service is connected. The site owner needs to configure Supabase and add an AI provider key on the server; those private credentials must never be placed in the public website.';
    }

    launcher.addEventListener('click', () => setOpen(panel.hidden));
    closeButton.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });

    if (!connected) {
        setConnectionMessage('Site guide mode · Live AI needs secure server setup.');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question || pending) return;
        addMessage('user', question);
        input.value = '';
        conversation.push({ role: 'user', content: question });
        if (!connected) {
            const answer = answerFromPublishedSite(question);
            conversation.push({ role: 'assistant', content: answer });
            addMessage('assistant', answer);
            return;
        }

        pending = true;
        input.disabled = true;
        form.querySelector('button[type="submit"]').disabled = true;
        const thinking = addMessage('assistant thinking', 'Thinking…');
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 30000);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(hasPublicKey ? {
                        apikey: config.anonKey,
                        Authorization: `Bearer ${config.anonKey}`
                    } : {})
                },
                body: JSON.stringify({ messages: conversation.slice(-10) }),
                signal: controller.signal
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'The AI service could not answer right now.');
            }
            if (typeof result.answer !== 'string' || !result.answer.trim()) {
                throw new Error('The AI service returned an empty answer. Please try again.');
            }
            conversation.push({ role: 'assistant', content: result.answer });
            const answer = document.createElement('p');
            answer.textContent = result.answer;
            thinking.replaceChildren(answer);
            thinking.classList.remove('thinking');
        } catch (error) {
            thinking.remove();
            conversation.pop();
            addMessage('assistant', error.name === 'AbortError'
                ? 'That took too long. Please try again in a moment.'
                : error.message || 'I could not connect just now. Please try again.');
        } finally {
            window.clearTimeout(timeout);
            pending = false;
            input.disabled = false;
            form.querySelector('button[type="submit"]').disabled = false;
            input.focus();
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });
})();
