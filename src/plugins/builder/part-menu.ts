/**
 * Opens the menu of a part as a right click on it would, at a client position.
 * Outside the interact tool, the editor keeps pointer events away from parts,
 * and passes a right click on to the part this way.
 *
 * Part menus open on a contextmenu event on an interaction area of the part:
 * the topmost area under the position, as a right click would hit it,
 * or else the first one.
 * The event does not bubble, so the editor does not receive it again.
 *
 * Returns whether the part has an interaction area.
 */
export function openPartMenu(
  partEl: Element,
  clientX: number,
  clientY: number,
): boolean {
  const areas = [
    ...partEl.querySelectorAll<HTMLElement>(
      '.interaction > foreignObject > .fit',
    ),
  ];
  // Later areas are rendered on top of earlier ones
  const area =
    areas.findLast((el) => {
      const { left, right, top, bottom } = el.getBoundingClientRect();
      return (
        clientX >= left &&
        clientX <= right &&
        clientY >= top &&
        clientY <= bottom
      );
    }) ?? areas[0];
  area?.dispatchEvent(
    new MouseEvent('contextmenu', {
      cancelable: true,
      button: 2,
      clientX,
      clientY,
    }),
  );
  return area != null;
}
