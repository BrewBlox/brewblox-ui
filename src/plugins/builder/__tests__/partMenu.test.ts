import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openPartMenu } from '../part-menu';

function interactionArea(id: string): string {
  return `
    <g class="interaction">
      <rect />
      <foreignObject><div id="${id}" class="fit"></div></foreignObject>
    </g>`;
}

function setRect(id: string, left: number, top: number): void {
  document.getElementById(id)!.getBoundingClientRect = () =>
    ({ left, top, right: left + 50, bottom: top + 50 }) as DOMRect;
}

function partElement(): Element {
  return document.getElementById('part')!;
}

describe('openPartMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <svg>
        <g id="part">
          ${interactionArea('first')}
          ${interactionArea('second')}
        </g>
      </svg>`;
    setRect('first', 0, 0);
    setRect('second', 100, 0);
  });

  it('opens the menu of the area under the position, at the position', () => {
    const first = vi.fn();
    const second = vi.fn();
    const bubbled = vi.fn();
    document.getElementById('first')!.addEventListener('contextmenu', first);
    document.getElementById('second')!.addEventListener('contextmenu', second);
    partElement().addEventListener('contextmenu', bubbled);

    expect(openPartMenu(partElement(), 120, 30)).toBe(true);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    const evt: MouseEvent = second.mock.calls[0][0];
    expect([evt.clientX, evt.clientY, evt.button]).toEqual([120, 30, 2]);
    // The editor must not receive its own event again
    expect(bubbled).not.toHaveBeenCalled();
  });

  it('opens the topmost area where areas overlap', () => {
    // A PWM area on the first square, on top of an area over the whole part
    setRect('second', 0, 0);
    document.getElementById('first')!.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 200, bottom: 50 }) as DOMRect;
    const first = vi.fn();
    const second = vi.fn();
    document.getElementById('first')!.addEventListener('contextmenu', first);
    document.getElementById('second')!.addEventListener('contextmenu', second);

    openPartMenu(partElement(), 25, 25);
    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });

  it('opens the first area when none is under the position', () => {
    const first = vi.fn();
    document.getElementById('first')!.addEventListener('contextmenu', first);

    expect(openPartMenu(partElement(), 75, 30)).toBe(true);
    expect(first).toHaveBeenCalledOnce();
  });

  it('does nothing for a part without an interaction area', () => {
    document.body.innerHTML = '<svg><g id="part"><rect /></g></svg>';
    expect(openPartMenu(partElement(), 10, 10)).toBe(false);
  });
});
