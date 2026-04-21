export default async function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      // Find YouTube links and convert to embedded video
      const links = cell.querySelectorAll('a');
      links.forEach((link) => {
        const href = link.href || '';
        const ytMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (ytMatch) {
          const videoId = ytMatch[1];
          const wrapper = document.createElement('div');
          wrapper.className = 'video-embed';
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1`;
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('loading', 'lazy');
          iframe.setAttribute('sandbox', 'allow-forms allow-modals allow-popups allow-scripts allow-same-origin');
          iframe.title = link.textContent || 'Video';
          wrapper.appendChild(iframe);
          // Replace the parent paragraph/button-container
          const parent = link.closest('p') || link.closest('.button-container') || link.parentElement;
          if (parent) {
            parent.replaceWith(wrapper);
          } else {
            link.replaceWith(wrapper);
          }
        }
      });
    });
  });
}
