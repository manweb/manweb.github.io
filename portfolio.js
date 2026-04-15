/* ============================================================
   NAVIGATION
   ============================================================ */
const nav = document.getElementById('nav');
const burger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('nav-mobile');
const navLinks = document.querySelectorAll('.nav-links .nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id]');

// Scrolled state (shadow)
function updateNavScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}

// Active link based on scroll position
function updateActiveLink() {
  const scrollY = window.scrollY + 90;
  let currentId = null;

  sections.forEach(section => {
    if (scrollY >= section.offsetTop) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href').slice(1);
    link.classList.toggle('active', href === currentId);
  });
}

window.addEventListener('scroll', () => {
  updateNavScroll();
  updateActiveLink();
}, { passive: true });

updateNavScroll();
updateActiveLink();

// Mobile menu toggle
burger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  });
});

// Close mobile menu on outside click
document.addEventListener('click', e => {
  if (!nav.contains(e.target)) {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
  }
});

/* ============================================================
   SCROLL ANIMATIONS (Intersection Observer)
   ============================================================ */
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // animate once
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

fadeEls.forEach(el => observer.observe(el));

/* ============================================================
   PUBLICATIONS — loaded from publications.csv
   ============================================================ */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    // Split on commas but not those inside the values — values use semicolons for lists
    const values = line.split(',');
    // Re-join any URL that contained commas (URLs don't, but be safe)
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim(); });
    return obj;
  });
}

function renderPublications(pubs) {
  const list = document.getElementById('pub-list');
  if (!list) return;

  list.innerHTML = pubs.map(p => {
    const authors = p.authors.replace(/;/g, ',');
    return `
      <article class="pub-item fade-in">
        <span class="pub-year">${p.year}</span>
        <div class="pub-details">
          <a href="${p.url}" target="_blank" rel="noopener" class="pub-title">${p.title}</a>
          <p class="pub-authors">${authors}</p>
          <p class="pub-venue">${p.venue}</p>
        </div>
        <a href="${p.url}" target="_blank" rel="noopener" class="pub-arrow" aria-label="Open paper">↗</a>
      </article>`;
  }).join('');

  // Register newly created elements with the scroll observer
  list.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ============================================================
   ABOUT — loaded from about.txt
   ============================================================ */
function renderAbout(text) {
  const container = document.getElementById('about-bio');
  if (!container) return;

  const lines = text.trim().split('\n');
  let html = '';
  let tags = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase().startsWith('tags:')) {
      tags = trimmed.slice(5).split(',').map(t => t.trim()).filter(Boolean);
    } else {
      // Convert **bold** markers to <strong>
      const parsed = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html += `<p>${parsed}</p>`;
    }
  });

  if (tags.length) {
    html += '<div class="about-tags">' +
      tags.map(t => `<span class="tag">${t}</span>`).join('') +
      '</div>';
  }

  container.innerHTML = html;
  observer.observe(container);
}

fetch('about.txt')
  .then(r => r.text())
  .then(text => renderAbout(text));

fetch('publications.csv')
  .then(r => r.text())
  .then(text => renderPublications(parseCSV(text)))
  .catch(() => {
    const list = document.getElementById('pub-list');
    if (list) list.innerHTML = '<p style="color:#888">Publications could not be loaded.</p>';
  });
