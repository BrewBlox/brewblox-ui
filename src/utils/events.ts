/**
 * Converts given KeyboardEvent to a string that includes modifiers.
 *
 * Known modifiers are: 'cmd', 'ctrl', 'alt', 'shift'.
 * Modifiers are always formatted in this order.
 *
 * Keys are always formatted as lowercase, and modifiers and keys are '+'-separated.
 *
 * Example output:
 * - 'e'
 * - 'shift+g'
 * - 'ctrl+alt+r'
 *
 * @param evt
 * @returns
 */
export function keyEventString(evt: KeyboardEvent): string {
  const modifiers: string[] = [];

  if (evt.metaKey && evt.key !== 'Meta') {
    modifiers.push('cmd');
  }
  if (evt.ctrlKey && evt.key !== 'Control') {
    modifiers.push('ctrl');
  }
  if (evt.altKey && evt.key !== 'Alt') {
    modifiers.push('alt');
  }
  if (evt.shiftKey && evt.key !== 'Shift') {
    modifiers.push('shift');
  }

  return [...modifiers, evt.key].join('+');
}
