import { beforeEach, describe, expect, it } from 'vitest';
import { isEditorEvent } from '../editor-events';

function keyOn(target: EventTarget): KeyboardEvent {
  const evt = new KeyboardEvent('keydown', { key: 's', bubbles: true });
  let received: KeyboardEvent | null = null;
  document.body.addEventListener('keydown', (e) => (received = e), {
    once: true,
  });
  target.dispatchEvent(evt);
  return received!;
}

const byId = (id: string): HTMLElement => document.getElementById(id)!;

describe('isEditorEvent', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="editor" tabindex="-1">
        <svg id="svg" tabindex="-1"></svg>
        <input id="editor-input" />
      </div>
      <div id="dialog"><input id="dialog-input" /></div>
      <button id="sidebar"></button>`;
  });

  it('handles events for the editor', () => {
    expect(isEditorEvent(keyOn(byId('editor')), byId('editor'))).toBe(true);
    expect(isEditorEvent(keyOn(byId('svg')), byId('editor'))).toBe(true);
  });

  it('handles events while nothing has focus', () => {
    expect(isEditorEvent(keyOn(document.body), byId('editor'))).toBe(true);
  });

  it('leaves fields, dialogs and other controls alone', () => {
    expect(isEditorEvent(keyOn(byId('editor-input')), byId('editor'))).toBe(
      false,
    );
    expect(isEditorEvent(keyOn(byId('dialog-input')), byId('editor'))).toBe(
      false,
    );
    expect(isEditorEvent(keyOn(byId('sidebar')), byId('editor'))).toBe(false);
  });

  it('handles nothing without an editor, such as without a layout', () => {
    expect(isEditorEvent(keyOn(byId('svg')), undefined)).toBe(false);
    expect(isEditorEvent(keyOn(document.body), undefined)).toBe(false);
  });
});
