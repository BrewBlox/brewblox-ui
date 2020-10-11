import Vue from 'vue';

export const refElement = (ref: Vue | Element | Vue[] | Element[]): HTMLElement | null => {
  if (ref === null || ref === undefined) {
    return null;
  }
  if (ref instanceof HTMLElement) {
    return ref;
  }
  if (ref instanceof Array) {
    return refElement(ref[0]);
  }
  if ('$el' in ref) {
    return refElement(ref.$el);
  }
  return null;
};
