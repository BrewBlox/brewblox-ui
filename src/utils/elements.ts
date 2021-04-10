export const refElement = (ref: Element | Element[]): HTMLElement | null => {
  if (ref === null || ref === undefined) {
    return null;
  }
  if (ref instanceof HTMLElement) {
    return ref;
  }
  if (ref instanceof Array) {
    return refElement(ref[0]);
  }
  // TODO(Bob) - make this work with vue 3 components
  // if ('$el' in ref) {
  //   return refElement(ref.$el);
  // }
  return null;
};
