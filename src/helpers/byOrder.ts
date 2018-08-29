export default function byOrder(a: { order: number }, b: { order: number }) {
  if (a.order < b.order) {
    return -1;
  }

  if (a.order > b.order) {
    return 1;
  }

  return 0;
}
