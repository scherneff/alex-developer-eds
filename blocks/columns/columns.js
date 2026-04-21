export default async function decorate(block) {
  // Add wrapper class for full-width styling
  const wrapper = block.parentElement;
  if (wrapper) {
    wrapper.classList.add('columns-wrapper');
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
