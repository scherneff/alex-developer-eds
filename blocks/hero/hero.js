export default async function decorate(block) {
  // Mark the parent section as full-width so the hero spans edge to edge
  const section = block.closest('.section');
  if (section) {
    section.classList.add('hero-container');
  }

  // Reset the wrapper div that sits between the section and the hero block
  const wrapper = block.parentElement;
  if (wrapper && wrapper !== section) {
    wrapper.style.maxWidth = 'unset';
    wrapper.style.width = '100%';
    wrapper.style.padding = '0';
    wrapper.style.margin = '0';
  }
}
