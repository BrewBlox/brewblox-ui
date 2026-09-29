import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BuilderInteraction from '../components/BuilderInteraction.vue';

// MutationObserver callbacks run as microtasks
const flush = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));

const namedAnchors = (): HTMLElement[] =>
  [...document.body.children].filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && !!el.style.getPropertyValue('anchor-name'),
  );

function mountInteraction(): {
  el: HTMLElement;
  unmount: () => void;
} {
  const wrapper = mount(BuilderInteraction, { attachTo: document.body });
  const el = wrapper.find('.fit').element as HTMLElement;
  el.getBoundingClientRect = () =>
    ({ left: 10, top: 20, width: 30, height: 40 }) as DOMRect;
  return { el, unmount: () => wrapper.unmount() };
}

describe('BuilderInteraction', () => {
  it('stands in for its element as menu anchor at the start of the body', async () => {
    const { el, unmount } = mountInteraction();

    // Quasar names the anchor of a menu that opens
    el.style.setProperty('anchor-name', '--q-pe-1');
    await flush();
    const [proxy] = namedAnchors();
    expect(proxy).toBe(document.body.firstElementChild);
    expect(proxy.style.getPropertyValue('anchor-name')).toBe('--q-pe-1');
    expect(proxy.style.position).toBe('fixed');
    expect(proxy.style.pointerEvents).toBe('none');
    expect([
      proxy.style.left,
      proxy.style.top,
      proxy.style.width,
      proxy.style.height,
    ]).toEqual(['10px', '20px', '30px', '40px']);

    // ... and removes the name when the menu is gone
    el.style.removeProperty('anchor-name');
    await flush();
    expect(namedAnchors()).toEqual([]);

    unmount();
  });

  it('moves the stand-in along when the page scrolls', async () => {
    const { el, unmount } = mountInteraction();
    el.style.setProperty('anchor-name', '--q-pe-3');
    await flush();

    // A scroll container inside the page scrolls the part up by 50px
    el.getBoundingClientRect = () =>
      ({ left: 10, top: -30, width: 30, height: 40 }) as DOMRect;
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.dispatchEvent(new Event('scroll'));
    expect(namedAnchors()[0].style.top).toBe('-30px');

    // Without a menu, scrolling leaves nothing behind
    el.style.removeProperty('anchor-name');
    await flush();
    container.dispatchEvent(new Event('scroll'));
    expect(namedAnchors()).toEqual([]);

    container.remove();
    unmount();
  });

  it('removes the stand-in when it is unmounted with a menu open', async () => {
    const { el, unmount } = mountInteraction();
    el.style.setProperty('anchor-name', '--q-pe-2');
    await flush();
    expect(namedAnchors()).toHaveLength(1);

    unmount();
    expect(namedAnchors()).toEqual([]);
  });
});
