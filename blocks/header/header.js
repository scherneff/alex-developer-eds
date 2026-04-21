/**
 * Header block – Alexa Developer Portal
 * Two-tier: brand bar (logo + search + utility) on top, main nav below.
 */

function buildBrandSection(div) {
  div.classList.add('header-brand');

  const logoLink = div.querySelector('a:has(img)');
  if (logoLink) logoLink.classList.add('header-logo');

  /* Turn the "Search" link into a search bar placeholder */
  const paras = [...div.querySelectorAll('p')];
  const searchP = paras.find((p) => {
    const a = p.querySelector('a');
    return a && a.textContent.trim().toLowerCase() === 'search';
  });
  if (searchP) {
    searchP.classList.add('header-search');
    searchP.innerHTML = `
      <span class="search-category">All &#9662;</span>
      <input type="text" placeholder="Search" aria-label="Search">
      <button class="search-btn" aria-label="Search">&#128269;</button>`;
  }

  /* Utility links (account | help) */
  const utilP = paras.find(
    (p) => !p.classList.contains('header-search') && !p.querySelector('img'),
  );
  if (utilP) utilP.classList.add('header-utility');
}

function buildNavSection(div) {
  div.classList.add('header-sections');

  const ul = div.querySelector('ul');
  if (!ul) return;
  ul.classList.add('header-nav');

  ul.querySelectorAll(':scope > li').forEach((li) => {
    const sub = li.querySelector(':scope > ul');
    if (sub) {
      li.classList.add('has-dropdown');
      sub.classList.add('header-dropdown');
      li.setAttribute('aria-expanded', 'false');

      const toggle = li.querySelector(':scope > a');
      if (toggle) {
        toggle.addEventListener('click', (e) => {
          if (window.innerWidth < 900) {
            e.preventDefault();
            const open = li.getAttribute('aria-expanded') === 'true';
            li.closest('ul').querySelectorAll(':scope > li.has-dropdown').forEach((s) => {
              s.setAttribute('aria-expanded', 'false');
            });
            li.setAttribute('aria-expanded', String(!open));
          }
        });

        /* Desktop: open on hover */
        li.addEventListener('mouseenter', () => {
          if (window.innerWidth >= 900) li.setAttribute('aria-expanded', 'true');
        });
        li.addEventListener('mouseleave', () => {
          if (window.innerWidth >= 900) li.setAttribute('aria-expanded', 'false');
        });
      }
    }
  });
}

export default async function decorate(block) {
  const navMeta = document.head.querySelector('meta[name="nav"]');
  const navPath = navMeta ? navMeta.content : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return;
  const html = await resp.text();

  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const sections = [...tmp.children]; // top-level <div>s

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', window.innerWidth >= 900 ? 'true' : 'false');

  sections.forEach((section, idx) => {
    if (idx === 0) buildBrandSection(section);
    else buildNavSection(section);
    nav.append(section);
  });

  /* Hamburger */
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
  nav.querySelector('.header-brand')?.append(hamburger);

  /* Keyboard */
  nav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      nav.querySelectorAll('.has-dropdown[aria-expanded="true"]').forEach((li) => {
        li.setAttribute('aria-expanded', 'false');
      });
      if (window.innerWidth < 900) {
        nav.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) nav.setAttribute('aria-expanded', 'true');
  });

  block.textContent = '';
  block.append(nav);
}
