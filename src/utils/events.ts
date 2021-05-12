
export function keyEventString(evt: KeyboardEvent): string {
  const modifiers: string[] = [];

  if (evt.metaKey) { modifiers.push('cmd'); }
  if (evt.ctrlKey) { modifiers.push('ctrl'); }
  if (evt.altKey) { modifiers.push('alt'); }
  if (evt.shiftKey) { modifiers.push('shift'); }

  return [...modifiers, evt.key].join('+');
}
