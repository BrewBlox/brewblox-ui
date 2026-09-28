/**
 * Whether the layout editor handles a keyboard or clipboard event.
 *
 * The editor listens on the page body, so its shortcuts work while it has focus
 * and while nothing has (focus is on the body, for example after a dialog closed).
 * Events for a field, a dialog, a menu or another control are left to them.
 * Without an editor (no layout, or still loading), there is nothing to handle.
 */
export function isEditorEvent(
  evt: Event,
  editorEl: Element | undefined,
): boolean {
  if (editorEl == null) {
    return false;
  }
  const target = evt.target;
  if (target === document.body) {
    return true;
  }
  return (
    target instanceof Element &&
    editorEl.contains(target) &&
    target.closest('input, textarea, select, [contenteditable]') == null
  );
}
