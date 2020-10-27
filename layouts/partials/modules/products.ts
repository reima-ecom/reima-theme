function colorDotClick(e: MouseEvent) {
  const colorDotLink = (e.target as HTMLElement).closest('[data-image-srcset]');
  if (colorDotLink) {
    e.preventDefault();
    const srcset = colorDotLink.getAttribute('data-image-srcset')!;
    colorDotLink.closest('li')!.querySelector<HTMLImageElement>('img')!.srcset = srcset;
  }
}

document.querySelectorAll<HTMLElement>('.product-list ul').forEach((element) => {
  console.log('adding event listener');
  element.addEventListener('click', colorDotClick);
});