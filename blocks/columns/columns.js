export default async function decorate(block) {
  // Add wrapper class for full-width styling
  const wrapper = block.parentElement;
  if (wrapper) {
    wrapper.classList.add('columns-wrapper');

    // Pull the preceding heading into the columns wrapper
    const prev = wrapper.previousElementSibling;
    if (prev && prev.classList.contains('default-content-wrapper')) {
      const h2 = prev.querySelector('h2');
      if (h2) {
        wrapper.insertBefore(h2, block);
        // Remove empty wrapper if nothing left
        if (!prev.children.length) prev.remove();
      }
    }
  }

  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell, i) => {
      if (i === 0) {
        cell.classList.add('columns-icon');
      } else {
        cell.classList.add('columns-cta');
      }
    });
  });
}
