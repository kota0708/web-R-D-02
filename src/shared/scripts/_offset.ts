export const offsetTop: (el: HTMLElement) => number = (el: HTMLElement) => {
  const rect: DOMRect = el.getBoundingClientRect() as DOMRect;
  const scrollTop: number =
    window.pageYOffset || document.documentElement.scrollTop;
  const myTop: number = rect.top + scrollTop;

  return myTop;
};

export const offsetLeft: (el: HTMLElement) => number = (el: HTMLElement) => {
  const rect: DOMRect = el.getBoundingClientRect() as DOMRect;
  const scrollLeft: number =
    window.pageXOffset || document.documentElement.scrollLeft;
  const myLeft: number = rect.left + scrollLeft;

  return myLeft;
};
