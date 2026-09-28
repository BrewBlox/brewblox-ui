import { mount, VueWrapper } from '@vue/test-utils';
import cloneDeep from 'lodash/cloneDeep';
import { Layout, PlotData } from 'plotly.js';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ShallowRef, shallowRef } from 'vue';
import PlotlyGraph from '@/components/graph/PlotlyGraph.vue';
import { GraphDataKey } from '@/components/graph/symbols';
import { notify } from '@/utils/notify';
import { guiRelayout, shownXRange, xAutorange } from '../../../../test/plotly';

const MIN = 60 * 1000;
const T0 = new Date(2026, 8, 28, 10, 0).getTime();

// Plotly reports date axis values in local time
const local = (minutes: number): string => {
  const d = new Date(T0 + minutes * MIN);
  const pad = (v: number): string => `${v}`.padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    ` ${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
};

// One point per minute, starting at T0
const trace = (minutes: number): Partial<PlotData> => ({
  uid: 'a',
  type: 'scatter',
  mode: 'lines',
  x: Array.from({ length: minutes + 1 }, (_, i) => T0 + i * MIN),
  y: Array.from({ length: minutes + 1 }, (_, i) => i % 7),
});

// Longer than the render debounce, and Plotly draws asynchronously
const settle = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 150));

interface Mounted {
  wrapper: VueWrapper;
  graphData: ShallowRef<Partial<PlotData>[]>;
  gd: () => HTMLElement;
}

const mounted: VueWrapper[] = [];

async function mountGraph(
  props: Record<string, unknown> = {},
  graphData = shallowRef([trace(60)]),
): Promise<Mounted> {
  const wrapper = mount(PlotlyGraph, {
    props: {
      layout: { width: 400, height: 300 },
      ...props,
    },
    global: {
      provide: { [GraphDataKey as symbol]: graphData },
    },
    attachTo: document.body,
  });
  mounted.push(wrapper);
  await settle();
  return {
    wrapper,
    graphData,
    gd: () => wrapper.find('.js-plotly-plot').element as HTMLElement,
  };
}

beforeAll(() => {
  // jsdom has no ResizeObserver, which q-resize-observer uses
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  );
  vi.spyOn(notify, 'warn');
});

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount());
  expect(notify.warn).not.toHaveBeenCalled();
});

describe('PlotlyGraph rendering', () => {
  it('keeps a zoom while data update', async () => {
    const { graphData, gd } = await mountGraph();
    expect(xAutorange(gd())).toBe(true);

    await guiRelayout(gd(), {
      'xaxis.range[0]': local(10),
      'xaxis.range[1]': local(20),
    });
    graphData.value = [trace(61)];
    await settle();

    expect((gd() as any).data[0].x).toHaveLength(62);
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);
  });

  it('keeps a zoom when the size changes', async () => {
    const { wrapper, gd } = await mountGraph();
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(10),
      'xaxis.range[1]': local(20),
    });

    await wrapper.setProps({ layout: { width: 500, height: 300 } });
    await settle();
    expect((gd() as any)._fullLayout.width).toBe(500);
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);

    window.dispatchEvent(new Event('resize'));
    await settle();
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);
  });

  it('renders data that change together with the layout', async () => {
    const { wrapper, graphData, gd } = await mountGraph();
    graphData.value = [trace(61)];
    await wrapper.setProps({ layout: { width: 500, height: 300 } });
    await settle();

    expect((gd() as any).data[0].x).toHaveLength(62);
    expect((gd() as any)._fullLayout.width).toBe(500);
  });

  it('leaves the layout it is given unchanged', async () => {
    const layout: Partial<Layout> = {
      width: 400,
      height: 300,
      xaxis: { title: { text: 'time' } },
      yaxis: { range: [0, 10], autorange: false },
      annotations: [{ x: T0, y: 1, text: 'note', showarrow: false }],
      shapes: [{ type: 'line', x0: T0, x1: T0, y0: 0, y1: 1, yref: 'paper' }],
    };
    const original = cloneDeep(layout);
    const { graphData, gd } = await mountGraph({ layout });

    await guiRelayout(gd(), {
      'xaxis.range[0]': local(10),
      'xaxis.range[1]': local(20),
      'yaxis.range[0]': 2,
      'yaxis.range[1]': 4,
    });
    graphData.value = [trace(61)];
    await settle();

    expect(layout).toEqual(original);
  });
});
