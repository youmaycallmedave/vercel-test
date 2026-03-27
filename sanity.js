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

async function fetchPostBySlug(slug) {
  const query = encodeURIComponent(
    `*[_type == "post" && slug.current == "${slug}"][0] { title, slug, tag, publishedAt, readTime, excerpt, body }`
  );
  const res = await fetch(`${SANITY_API_URL}?query=${query}`);
  const data = await res.json();
  return data.result || null;
}

// Portable Text → HTML (handles bold, italic, links, headings)
function blocksToHtml(blocks) {
  if (!blocks || !blocks.length) return '';
  return blocks.map(block => {
    if (block._type !== 'block') return '';
    const tag = block.style === 'h1' ? 'h1'
      : block.style === 'h2' ? 'h2'
      : block.style === 'h3' ? 'h3'
      : block.style === 'h4' ? 'h4'
      : block.style === 'blockquote' ? 'blockquote'
      : 'p';

    const text = (block.children || []).map(span => {
      let t = span.text || '';
      t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (span.marks?.includes('strong')) t = `<strong>${t}</strong>`;
      if (span.marks?.includes('em')) t = `<em>${t}</em>`;
      if (span.marks?.includes('code')) t = `<code>${t}</code>`;
      return t;
    }).join('');

    return `<${tag}>${text}</${tag}>`;
  }).join('\n');
}

function createBlogCardFull(post) {
  const el = document.createElement('a');
  el.href = `post.html?slug=${post.slug?.current || ''}`;
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
  el.href = `post.html?slug=${post.slug?.current || ''}`;
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

// ── Blog list page ──
const blogList = document.getElementById('blog-list');
if (blogList) {
  fetchPosts().then(posts => {
    blogList.innerHTML = '';
    if (!posts.length) {
      blogList.innerHTML = '<p style="color:var(--muted)">No posts yet.</p>';
      return;
    }
    posts.forEach(post => blogList.appendChild(createBlogCardFull(post)));

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

// ── Homepage latest 3 posts ──
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

// ── Homepage slider ──
const sliderTrack = document.getElementById('slider-track');
if (sliderTrack) {
  const query = encodeURIComponent(
    `*[_type == "slide"] | order(order asc) { title, subtitle, image, buttonText, buttonUrl }`
  );
  fetch(`${SANITY_API_URL}?query=${query}`)
    .then(r => r.json())
    .then(data => {
      const slides = data.result || [];
      if (!slides.length) {
        document.getElementById('hero-slider').innerHTML = `
          <div class="slide active">
            <div class="slide-content">
              <h1>Welcome to MySite</h1>
              <p>Add slides in Sanity Studio to customize this section.</p>
              <a href="about.html" class="btn">Learn more</a>
            </div>
          </div>`;
        return;
      }

      const dots = document.getElementById('slider-dots');
      let current = 0;

      slides.forEach((slide, i) => {
        const imgUrl = slide.image?.asset?._ref
          ? sanityImageUrl(slide.image.asset._ref) + '?w=1400&fit=crop'
          : null;

        const el = document.createElement('div');
        el.className = 'slide' + (i === 0 ? ' active' : '');
        if (imgUrl) el.style.backgroundImage = `url(${imgUrl})`;
        el.innerHTML = `
          <div class="slide-overlay"></div>
          <div class="slide-content">
            <h1>${slide.title}</h1>
            ${slide.subtitle ? `<p>${slide.subtitle}</p>` : ''}
            ${slide.buttonText ? `<a href="${slide.buttonUrl || '#'}" class="btn">${slide.buttonText}</a>` : ''}
          </div>
        `;
        sliderTrack.appendChild(el);

        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dots.appendChild(dot);
      });

      function goTo(n) {
        sliderTrack.children[current].classList.remove('active');
        dots.children[current].classList.remove('active');
        current = (n + slides.length) % slides.length;
        sliderTrack.children[current].classList.add('active');
        dots.children[current].classList.add('active');
      }

      document.getElementById('slider-prev').addEventListener('click', () => goTo(current - 1));
      document.getElementById('slider-next').addEventListener('click', () => goTo(current + 1));

      // Auto-advance every 5s
      setInterval(() => goTo(current + 1), 5000);
    });
}

// ── Team page ──
const teamGrid = document.getElementById('team-grid');
if (teamGrid) {
  const query = encodeURIComponent(
    `*[_type == "teamMember"] | order(order asc) { name, role, bio, photo, links }`
  );
  fetch(`${SANITY_API_URL}?query=${query}`)
    .then(r => r.json())
    .then(data => {
      const members = data.result || [];
      teamGrid.innerHTML = '';
      if (!members.length) {
        teamGrid.innerHTML = '<p style="color:var(--muted)">No team members yet.</p>';
        return;
      }
      members.forEach(m => {
        const photoUrl = m.photo?.asset?._ref
          ? sanityImageUrl(m.photo.asset._ref)
          : null;

        const links = [
          m.links?.twitter  ? `<a href="${m.links.twitter}"  target="_blank" rel="noopener">Twitter</a>`  : '',
          m.links?.linkedin ? `<a href="${m.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>` : '',
          m.links?.github   ? `<a href="${m.links.github}"   target="_blank" rel="noopener">GitHub</a>`   : ''
        ].filter(Boolean).join('');

        const card = document.createElement('div');
        card.className = 'team-page-card';
        card.innerHTML = `
          ${photoUrl
            ? `<img src="${photoUrl}" alt="${m.name}" class="team-photo" />`
            : `<div class="avatar">${m.name?.[0] || '?'}</div>`
          }
          <div class="team-page-info">
            <h3>${m.name}</h3>
            <p class="team-role">${m.role}</p>
            ${m.bio ? `<p class="team-bio">${m.bio}</p>` : ''}
            ${links ? `<div class="team-links">${links}</div>` : ''}
          </div>
        `;
        teamGrid.appendChild(card);
      });
    })
    .catch(() => {
      teamGrid.innerHTML = '<p style="color:var(--muted)">Failed to load team.</p>';
    });
}

function sanityImageUrl(ref) {
  // ref format: image-abc123-800x600-jpg
  const [, id, dimensions, ext] = ref.split('-');
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${ext}`;
}

// ── Single post page ──
const postContent = document.getElementById('post-content');
const relatedGrid = document.getElementById('related-grid');

if (postContent) {
  const slug = new URLSearchParams(window.location.search).get('slug');

  if (!slug) {
    postContent.innerHTML = '<p style="color:var(--muted)">Post not found.</p>';
  } else {
    fetchPostBySlug(slug).then(post => {
      if (!post) {
        postContent.innerHTML = '<p style="color:var(--muted)">Post not found.</p>';
        return;
      }

      document.title = `MySite — ${post.title}`;

      postContent.innerHTML = `
        <article class="post-article">
          <div class="post-header">
            <div class="post-header-meta">
              <div class="blog-tag">${post.tag || ''}</div>
              <div class="blog-meta">
                <span>${formatDate(post.publishedAt)}</span>
                <span>${post.readTime || ''} min read</span>
              </div>
            </div>
            <h1>${post.title}</h1>
            <p class="post-excerpt">${post.excerpt || ''}</p>
          </div>
          <div class="post-body">
            ${post.body ? blocksToHtml(post.body) : '<p style="color:var(--muted)">No content yet.</p>'}
          </div>
        </article>
      `;
    }).catch(() => {
      postContent.innerHTML = '<p style="color:var(--muted)">Failed to load post.</p>';
    });

    // Related posts (all except current)
    fetchPosts(4).then(posts => {
      const others = posts.filter(p => p.slug?.current !== slug).slice(0, 3);
      relatedGrid.innerHTML = '';
      if (!others.length) {
        relatedGrid.innerHTML = '<p style="color:var(--muted)">No other posts yet.</p>';
        return;
      }
      others.forEach(p => relatedGrid.appendChild(createBlogCard(p)));
    });
  }
}
