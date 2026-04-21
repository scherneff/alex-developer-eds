export default async function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    // First cell is image, second cell is CTA link - structure is correct as-is
    if (cells.length >= 2) {
      cells[0].classList.add('link-cards-icon');
      cells[1].classList.add('link-cards-cta');
    }
  });
}
