const getElementIndex = (node: Element) => {
  let index = 0;
  let currentSibling = node.previousElementSibling;
  while (currentSibling) {
    index += 1;
    currentSibling = currentSibling.previousElementSibling;
  }
  return index;
};

export default getElementIndex;
