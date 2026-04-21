/**
 * Header block – Alexa Developer Portal
 * AEM serves nav.plain.html as a single <div> with logo, search, account, then nav <ul>
 */

export default async function decorate(block) {
  const navMeta = document.head.querySelector('meta[name="nav"]');
  const navPath = navMeta ? navMeta.content : '/nav';

  const resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return;
  const html = await resp.text();

  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  // AEM: all content is in a single top-level div
  const sourceDiv = tmp.querySelector(':scope > div') || tmp;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', window.innerWidth >= 900 ? 'true' : 'false');

  // Brand section: logo, search, account (everything before the <ul>)
  const brand = document.createElement('div');
  brand.classList.add('header-brand');

  const mainUl = sourceDiv.querySelector(':scope > ul');
  const nodes = [...sourceDiv.childNodes];
  const ulIdx = nodes.indexOf(mainUl);

  // Pre-ul nodes → brand
  nodes.slice(0, ulIdx < 0 ? nodes.length : ulIdx).forEach((node) => {
    if (node.nodeType === 1) { // element
      const el = node;
      if (el.tagName === 'P') {
        const a = el.querySelector('a');
        if (a?.querySelector('img, picture')) {
          el.classList.add('header-logo');
        } else if (a?.textContent.trim().toLowerCase() === 'search') {
          el.classList.add('header-search');
          el.innerHTML = `
            <span class="search-category">All &#9662;</span>
            <input type="text" placeholder="Search" aria-label="Search">
            <button class="search-btn" aria-label="Search">&#128269;</button>`;
        } else {
          el.classList.add('header-utility');
        }
      }
      brand.append(el.cloneNode(true));
    }
  });

  nav.append(brand);

  // Nav <ul>
  if (mainUl) {
    const navSection = document.createElement('div');
    navSection.classList.add('header-sections');
    const ul = mainUl.cloneNode(true);
    ul.classList.add('header-nav');

    // Add dropdown support
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

  // Hamburger
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
