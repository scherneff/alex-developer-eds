/**
 * Header block – Alexa Developer Portal
 */

export default async function decorate(block) {
  const navMeta = document.head.querySelector('meta[name="nav"]');
  const navPath = navMeta ? navMeta.content : '/nav';
  const navUrl = new URL(navPath, window.location.origin);

  const resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return;
  const html = await resp.text();

  // Parse into a temporary document so relative URLs resolve against the nav URL
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<base href="${navUrl.href}">` + html, 'text/html');

  // Fix all relative image srcs to be absolute
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('//')) {
      img.setAttribute('src', new URL(src, navUrl.href).href);
    }
  });
  doc.querySelectorAll('source').forEach((src) => {
    const ss = src.getAttribute('srcset');
    if (ss && !ss.startsWith('http') && !ss.startsWith('//')) {
      src.setAttribute('srcset', new URL(ss, navUrl.href).href);
    }
  });

  const sourceDiv = doc.querySelector('body > div') || doc.body;
  const mainUl = sourceDiv.querySelector(':scope > ul');
  const nodes = [...sourceDiv.childNodes];
  const ulIdx = mainUl ? nodes.indexOf(mainUl) : nodes.length;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', window.innerWidth >= 900 ? 'true' : 'false');

  const brand = document.createElement('div');
  brand.classList.add('header-brand');

  nodes.slice(0, ulIdx).forEach((node) => {
    if (node.nodeType !== 1) return;
    const el = node.cloneNode(true);
    if (el.tagName === 'P') {
      if (el.querySelector('img, picture')) {
        el.classList.add('header-logo');
      } else if (el.querySelector('a')?.textContent.trim().toLowerCase() === 'search') {
        el.classList.add('header-search');
        el.innerHTML = `
          <span class="search-category">All &#9662;</span>
          <input type="text" placeholder="Search" aria-label="Search">
          <button class="search-btn" aria-label="Search">&#128269;</button>`;
      } else {
        el.classList.add('header-utility');
      }
    }
    brand.append(el);
  });

  nav.append(brand);

  if (mainUl) {
    const navSection = document.createElement('div');
    navSection.classList.add('header-sections');
    const ul = mainUl.cloneNode(true);
    ul.classList.add('header-nav');

    ul.querySelectorAll(':scope > li').forEach((li) => {
      const sub = li.querySelector(':scope > ul');
      if (sub) {
        li.classList.add('has-dropdown');
        sub.classList.add('header-dropdown');
        li.setAttribute('aria-expanded', 'false');
        const toggle = li.querySelector(':scope > p > a, :scope > a');
        if (toggle) {
          toggle.addEventListener('click', (e) => {
            if (window.innerWidth < 900) {
              e.preventDefault();
              const open = li.getAttribute('aria-expanded') === 'true';
              ul.querySelectorAll(':scope > li').forEach((s) => s.setAttribute('aria-expanded', 'false'));
              li.setAttribute('aria-expanded', String(!open));
            }
          });
        }
      }
    });

    navSection.append(ul);
    nav.append(navSection);
  }

  const hamburger = document.createElement('button');
  hamburger.classList.add('header-hamburger');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  hamburger.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', String(!open));
    hamburger.setAttribute('aria-expanded', String(!open));
  });
  brand.append(hamburger);

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) nav.setAttribute('aria-expanded', 'true');
  });

  block.textContent = '';
  block.append(nav);
}
