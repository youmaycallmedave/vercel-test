const SANITY_PROJECT_ID = 'w3v2dh14';
const SANITY_DATASET = 'production';
const SANITY_API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}`;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function fetchPosts(limit = null) {
  const limitClause = limit ? `[0...${limit}]` : '';
  const query = encodeURIComponent(
    `*[_type == "post"] | order(publishedAt desc) ${limitClause} { title, slug, tag, publishedAt, readTime, excerpt }`
  );
  const res = await fetch(`${SANITY_API_URL}?query=${query}`);
  const data = await res.json();
  return data.result || [];
}

function createBlogCardFull(post) {
  const el = document.createElement('a');
  el.href = `blog.html#${post.slug?.current || ''}`;
  el.className = 'blog-card-full';
  el.dataset.tag = post.tag || '';
  el.innerHTML = `
    <div class="blog-card-full-meta">
      <div class="blog-tag">${post.tag || ''}</div>
      <div class="blog-meta">
        <span>${formatDate(post.publishedAt)}</span>
        <span>${post.readTime || ''} min read</span>
      </div>
    </div>
    <div class="blog-card-full-body">
      <h2>${post.title || ''}</h2>
      <p>${post.excerpt || ''}</p>
    </div>
    <span class="read-more">Read post →</span>
  `;
  return el;
}

function createBlogCard(post) {
  const el = document.createElement('a');
  el.href = `blog.html#${post.slug?.current || ''}`;
  el.className = 'blog-card';
  el.innerHTML = `
    <div class="blog-tag">${post.tag || ''}</div>
    <h3>${post.title || ''}</h3>
    <p>${post.excerpt || ''}</p>
    <div class="blog-meta">
      <span>${formatDate(post.publishedAt)}</span>
      <span>${post.readTime || ''} min read</span>
    </div>
  `;
  return el;
}

// Blog page
const blogList = document.getElementById('blog-list');
if (blogList) {
  fetchPosts().then(posts => {
    blogList.innerHTML = '';
    if (!posts.length) {
      blogList.innerHTML = '<p style="color:var(--muted)">No posts yet.</p>';
      return;
    }
    posts.forEach(post => blogList.appendChild(createBlogCardFull(post)));

    // re-init filters after posts load
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.blog-card-full').forEach(card => {
          card.classList.toggle('hidden', filter !== 'all' && card.dataset.tag !== filter);
        });
      });
    });
  }).catch(() => {
    blogList.innerHTML = '<p style="color:var(--muted)">Failed to load posts.</p>';
  });
}

// Homepage — latest 3 posts
const homeGrid = document.getElementById('home-blog-grid');
if (homeGrid) {
  fetchPosts(3).then(posts => {
    homeGrid.innerHTML = '';
    if (!posts.length) {
      homeGrid.innerHTML = '<p style="color:var(--muted)">No posts yet.</p>';
      return;
    }
    posts.forEach(post => homeGrid.appendChild(createBlogCard(post)));
  }).catch(() => {
    homeGrid.innerHTML = '<p style="color:var(--muted)">Failed to load posts.</p>';
  });
}
