export default async function decorate(block) {
  // Fix relative ./media_ URLs — they resolve against the page URL, not /footer
  const footerMeta = document.head.querySelector('meta[name="footer"]');
  const footerPath = footerMeta ? footerMeta.content : '/footer';
  const footerBase = new URL(footerPath, window.location.origin).href;

  // After the fragment loads, fix all relative image sources
  // Use a MutationObserver to catch images added by loadFragment
  const fixImages = (root) => {
    root.querySelectorAll('img[src^="./media_"], source[srcset^="./media_"]').forEach((el) => {
      const attr = el.tagName === 'IMG' ? 'src' : 'srcset';
      const val = el.getAttribute(attr);
      if (val?.startsWith('./')) {
        el.setAttribute(attr, new URL(val, footerBase).href);
      }
    });
  };

  // Observe the footer element for added nodes
  const footer = block.closest('footer') || block.parentElement;
  const observer = new MutationObserver(() => fixImages(footer));
  observer.observe(footer, { childList: true, subtree: true });

  // Also fix immediately in case images are already present
  fixImages(footer);

  // Stop observing after 5s
  setTimeout(() => observer.disconnect(), 5000);
}
