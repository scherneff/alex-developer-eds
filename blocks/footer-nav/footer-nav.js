export default async function decorate(block) {
  // Row 1 = nav columns, Row 2 = social, Row 3 = logos, Row 4 = copyright
  const rows = [...block.children];

  // Social row: ensure images display inline
  if (rows[1]) {
    const socialImages = rows[1].querySelectorAll('picture');
    socialImages.forEach((pic) => {
      pic.style.display = 'inline';
    });
  }

  // Logos row: ensure images display inline
  if (rows[2]) {
    const logoImages = rows[2].querySelectorAll('picture');
    logoImages.forEach((pic) => {
      pic.style.display = 'inline';
    });
  }
}
