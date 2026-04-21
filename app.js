const ONE_HOUR = 60 * 60 * 1000;
const FAST_DEMO_MINUTES = 3;

const sections = [
  'World',
  'Politics',
  'Business',
  'Technology',
  'Sports',
  'Entertainment',
  'Lifestyle',
];

const headlineStarts = [
  'Breaking',
  'Analysis',
  'Special Report',
  'Developing',
  'Inside Story',
  'Exclusive',
];

const headlineTopics = [
  'Summit',
  'Market Shift',
  'AI Regulation',
  'Championship Push',
  'Climate Response',
  'Cultural Revival',
  'Healthcare Strategy',
  'Transit Overhaul',
];

const summaryFragments = [
  'Officials say the latest developments are likely to shape next quarter outcomes.',
  'Residents report mixed reactions as implementation moves to the next phase.',
  'Experts note that momentum has accelerated after recent announcements.',
  'Key stakeholders are expected to publish a joint statement by evening.',
  'The story remains fluid, with additional updates expected throughout the day.',
];

const updatesPool = [
  'New data has been added by field reporters.',
  'Sources close to the issue confirmed a timeline adjustment.',
  'Public response online has intensified over the last hour.',
  'An official spokesperson issued a brief clarification.',
  'Editors marked this topic as a high-priority developing story.',
];

const state = {
  articles: [],
  comments: loadComments(),
  agent: {
    lastRun: null,
    nextRun: Date.now() + ONE_HOUR,
  },
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nowStamp(ts = Date.now()) {
  return new Date(ts).toLocaleString();
}

function generateArticle(section) {
  const id = crypto.randomUUID();
  const headline = `${pick(headlineStarts)}: ${pick(headlineTopics)} in ${section}`;
  return {
    id,
    section,
    headline,
    summary: `${pick(summaryFragments)} ${pick(summaryFragments)}`,
    createdAt: Date.now(),
    updates: [
      { id: crypto.randomUUID(), text: 'Initial AI draft published.', at: Date.now() },
    ],
  };
}

function updateExistingArticle(article) {
  article.updates.unshift({
    id: crypto.randomUUID(),
    text: pick(updatesPool),
    at: Date.now(),
  });
  article.updates = article.updates.slice(0, 5);
}

function seedInitialArticles() {
  state.articles = sections.map((section) => generateArticle(section));
}

function runAgentCycle({ manual = false } = {}) {
  const section = pick(sections);
  const shouldCreate = Math.random() > 0.45 || state.articles.length < 8;

  if (shouldCreate) {
    state.articles.unshift(generateArticle(section));
    state.articles = state.articles.slice(0, 16);
  }

  const ongoing = [...state.articles]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);
  ongoing.forEach(updateExistingArticle);

  state.agent.lastRun = Date.now();
  state.agent.nextRun = state.agent.lastRun + ONE_HOUR;

  render(manual ? 'Agent executed manually.' : 'Agent completed its hourly generation cycle.');
}

function leadArticle() {
  return [...state.articles].sort((a, b) => b.createdAt - a.createdAt)[0];
}

function loadComments() {
  try {
    const raw = localStorage.getItem('hourly-chronicle-comments');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistComments() {
  localStorage.setItem('hourly-chronicle-comments', JSON.stringify(state.comments));
}

function commentsFor(articleId) {
  return state.comments[articleId] ?? [];
}

function addComment(articleId, author, content) {
  const list = commentsFor(articleId);
  list.unshift({ id: crypto.randomUUID(), author, content, at: Date.now() });
  state.comments[articleId] = list.slice(0, 30);
  persistComments();
}

function render(statusMessage) {
  const lead = leadArticle();
  const leadContainer = document.getElementById('lead-article');
  leadContainer.innerHTML = lead
    ? `
      <h3>${lead.headline}</h3>
      <p class="meta">${lead.section} · Published ${nowStamp(lead.createdAt)}</p>
      <p>${lead.summary}</p>
    `
    : '<p>No stories yet.</p>';

  const sectionsContainer = document.getElementById('sections');
  sectionsContainer.innerHTML = '';

  state.articles.forEach((article) => {
    const tpl = document.getElementById('article-template');
    const node = tpl.content.firstElementChild.cloneNode(true);

    node.querySelector('.section-label').textContent = article.section;
    node.querySelector('.headline').textContent = article.headline;
    node.querySelector('.meta').textContent = `Published ${nowStamp(article.createdAt)}`;
    node.querySelector('.summary').textContent = article.summary;

    const updatesList = node.querySelector('.updates-list');
    article.updates.forEach((u) => {
      const li = document.createElement('li');
      li.textContent = `${nowStamp(u.at)} — ${u.text}`;
      updatesList.append(li);
    });

    const commentsList = node.querySelector('.comments-list');
    const comments = commentsFor(article.id);
    if (!comments.length) {
      const li = document.createElement('li');
      li.textContent = 'No comments yet. Start the discussion.';
      commentsList.append(li);
    } else {
      comments.forEach((comment) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${comment.author}</strong> (${nowStamp(comment.at)}): ${comment.content}`;
        commentsList.append(li);
      });
    }

    node.querySelector('.comment-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const author = form.author.value.trim();
      const content = form.content.value.trim();
      if (!author || !content) {
        return;
      }
      addComment(article.id, author, content);
      render('Comment posted.');
    });

    sectionsContainer.append(node);
  });

  document.getElementById('last-run').textContent = `Last run: ${
    state.agent.lastRun ? nowStamp(state.agent.lastRun) : 'Not run yet'
  }`;
  document.getElementById('next-run').textContent = `Next run: ${nowStamp(state.agent.nextRun)}`;

  if (statusMessage) {
    document.getElementById('next-run').insertAdjacentHTML('beforeend', ` · ${statusMessage}`);
  }
}

function scheduleAgent() {
  setInterval(runAgentCycle, ONE_HOUR);
}

function startDemoTicker() {
  setInterval(() => {
    const next = new Date(state.agent.nextRun);
    const mins = Math.max(0, Math.floor((next.getTime() - Date.now()) / 60000));
    document.getElementById('next-run').textContent = `Next run: ${nowStamp(state.agent.nextRun)} (${mins} min)`;
  }, 10_000);

  // Demo-only helper: a lightweight simulation every few minutes for easier testing.
  setInterval(() => runAgentCycle(), FAST_DEMO_MINUTES * 60 * 1000);
}

seedInitialArticles();
runAgentCycle();
scheduleAgent();
startDemoTicker();

document.getElementById('run-now').addEventListener('click', () => runAgentCycle({ manual: true }));
