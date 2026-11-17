import { mount, VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, VNode, withDirectives } from 'vue';
import AnimatedArrows from '../components/AnimatedArrows.vue';
import { vSkipSmilReplay } from '../smil';

// jsdom has no SMIL timeline: give every <svg> a fake clock
let seeks: [Element, number][] = [];

beforeEach(() => {
  seeks = [];
  const proto = window.SVGSVGElement.prototype as any;
  proto.getCurrentTime = function (): number {
    return 1234.5;
  };
  proto.setCurrentTime = function (t: number): void {
    seeks.push([this, t]);
  };
});

afterEach(() => {
  const proto = window.SVGSVGElement.prototype as any;
  delete proto.getCurrentTime;
  delete proto.setCurrentTime;
});

const flushMicrotasks = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));

async function update(): Promise<void> {
  await nextTick();
  await flushMicrotasks();
}

function mountSvg(render: () => VNode): VueWrapper {
  const Wrapper = defineComponent({ setup: () => render });
  return mount(Wrapper, { attachTo: document.body });
}

const arrows = (speed: number): VNode =>
  h(AnimatedArrows, { path: 'M0,25 L50,25', speed });

describe('AnimatedArrows on the SMIL clock', () => {
  it('seeks the part svg to its own time once when arrows are created', async () => {
    const wrapper = mountSvg(() =>
      h('svg', [h('svg', { class: 'part' }, [arrows(1)])]),
    );
    await flushMicrotasks();

    expect(wrapper.findAll('animateMotion')).toHaveLength(2);
    expect(seeks).toEqual([[wrapper.find('svg.part').element, 1234.5]]);
    wrapper.unmount();
  });

  it('seeks again when a new speed recreates the arrows', async () => {
    const speed = ref(1);
    const wrapper = mountSvg(() =>
      h('svg', { class: 'part' }, [arrows(speed.value)]),
    );
    await flushMicrotasks();
    seeks = [];

    speed.value = 2;
    await update();

    expect(seeks).toEqual([[wrapper.find('svg.part').element, 1234.5]]);
    wrapper.unmount();
  });

  it('does not seek without arrows', async () => {
    const speed = ref(0);
    const wrapper = mountSvg(() => h('svg', [arrows(speed.value)]));
    await flushMicrotasks();

    speed.value = -0;
    await update();

    expect(seeks).toEqual([]);
    wrapper.unmount();
  });

  it('seeks each part svg once when several get arrows in one update', async () => {
    const speed = ref(0);
    const wrapper = mountSvg(() =>
      h(
        'svg',
        [1, 2].map((n) =>
          h('svg', { class: `part-${n}` }, [arrows(speed.value)]),
        ),
      ),
    );
    await flushMicrotasks();

    speed.value = 1;
    await update();

    expect(seeks.map(([svg]) => svg.getAttribute('class'))).toEqual([
      'part-1',
      'part-2',
    ]);
    wrapper.unmount();
  });

  it('seeks again after a seek failed', async () => {
    const proto = window.SVGSVGElement.prototype as any;
    const seek = proto.setCurrentTime;
    proto.setCurrentTime = function (): void {
      proto.setCurrentTime = seek;
      throw new Error('seek failed');
    };
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const speed = ref(1);
    const wrapper = mountSvg(() =>
      h('svg', { class: 'part' }, [arrows(speed.value)]),
    );
    await flushMicrotasks();
    expect(error).toHaveBeenCalled();

    speed.value = 2;
    await update();

    expect(seeks).toEqual([[wrapper.find('svg.part').element, 1234.5]]);
    error.mockRestore();
    wrapper.unmount();
  });

  it('mounts where the browser has no SMIL timeline', async () => {
    const proto = window.SVGSVGElement.prototype as any;
    delete proto.getCurrentTime;
    delete proto.setCurrentTime;
    const warn = vi.spyOn(console, 'warn');

    const wrapper = mountSvg(() => h('svg', [arrows(1)]));
    await flushMicrotasks();

    expect(wrapper.findAll('animateMotion')).toHaveLength(2);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    wrapper.unmount();
  });
});

describe('vSkipSmilReplay', () => {
  it('seeks when an animation is inserted, as the pump does on switching on', async () => {
    const active = ref(false);
    const wrapper = mountSvg(() =>
      h('svg', { class: 'part' }, [
        h('g', [
          active.value
            ? withDirectives(
                h('animateTransform', {
                  attributeName: 'transform',
                  type: 'rotate',
                  dur: '1s',
                  repeatCount: 'indefinite',
                }),
                [[vSkipSmilReplay]],
              )
            : null,
        ]),
      ]),
    );
    await flushMicrotasks();
    expect(seeks).toEqual([]);

    active.value = true;
    await update();
    expect(seeks).toEqual([[wrapper.find('svg.part').element, 1234.5]]);

    active.value = false;
    await update();
    expect(seeks).toHaveLength(1);
    wrapper.unmount();
  });
});
