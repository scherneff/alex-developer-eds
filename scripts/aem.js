/*
 * AEM EDS - Core Scripts
 * Minimal boilerplate loader
 */

const LCP_BLOCKS = [];

function sampleRUM() {}

function loadScript(src, attrs) {
  const script = document.createElement('script');
  script.src = src;
  if (attrs) Object.keys(attrs).forEach((attr) => script.setAttribute(attr, attrs[attr]));
  document.head.append(script);
  return script;
}

async function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.append(link);
    } else {
      resolve();
    }
  });
}

async function loadBlock(block) {
  const status = block.dataset.blockStatus;
  if (status !== 'loading' && status !== 'loaded') {
    block.dataset.blockStatus = 'loading';
    const blockName = block.dataset.blockName;
    try {
      const cssLoaded = loadCSS(`/blocks/${blockName}/${blockName}.css`);
      const mod = await import(`/blocks/${blockName}/${blockName}.js`);
      await cssLoaded;
      if (mod.default) await mod.default(block);
    } catch (err) {
      console.error(`Failed loading block: ${blockName}`, err);
    }
    block.dataset.blockStatus = 'loaded';
  }
  return block;
}

function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName) {
    block.classList.add('block');
    block.dataset.blockName = shortBlockName;
    block.dataset.blockStatus = 'initialized';
  }
}

function decorateBlocks(main) {
  main.querySelectorAll('div.section > div > div').forEach(decorateBlock);
}

function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
  });
}

function decorateButtons(main) {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href && a.textContent) {
      const p = a.closest('p');
      if (p) {
        p.classList.add('button-container');
        a.classList.add('button', 'primary');
      }
    }
  });
}

function decoratePictures(main) {
  main.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    if (!picture.querySelector('source')) {
      const source = document.createElement('source');
      source.srcset = img.src;
      picture.prepend(source);
    }
  });
}

async function loadFragment(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok) {
    const main = document.createElement('main');
    main.innerHTML = await resp.text();
    decorateSections(main);
    decorateBlocks(main);
    await Promise.all([...main.querySelectorAll('.block')].map(loadBlock));
    return main;
  }
  return null;
}

async function loadHeader(header) {
  const block = document.createElement('div');
  block.classList.add('header', 'block');
  block.dataset.blockName = 'header';
  block.dataset.blockStatus = 'initialized';
  header.append(block);
  await loadBlock(block);
}

async function loadFooter(footer) {
  const meta = document.head.querySelector('meta[name="footer"]');
  const footerPath = meta ? meta.content : '/footer';
  const fragment = await loadFragment(footerPath);
  if (fragment) {
    footer.append(...fragment.childNodes);
  }
}

async function loadPage() {
  const main = document.querySelector('main');
  if (main) {
    decorateSections(main);
    decorateBlocks(main);
    decorateButtons(main);
    decoratePictures(main);
    const blocks = [...main.querySelectorAll('.block')];
    await Promise.all(blocks.map(loadBlock));
  }
  await Promise.all([
    loadHeader(document.querySelector('header')),
    loadFooter(document.querySelector('footer')),
  ]);
  document.body.classList.add('appear');
}

loadPage();
