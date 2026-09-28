import { mount, VueWrapper } from '@vue/test-utils';
import cloneDeep from 'lodash/cloneDeep';
import { Layout, PlotData } from 'plotly.js';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ShallowRef, shallowRef } from 'vue';
import PlotlyGraph from '@/components/graph/PlotlyGraph.vue';
import { GraphDataKey } from '@/components/graph/symbols';
import {
  emptyGraphView,
  GraphView,
  parsePlotlyRange,
} from '@/components/graph/view';
import { notify } from '@/utils/notify';
import {
  doubleClick,
  guiRelayout,
  shownXRange,
  xAutorange,
} from '../../../../test/plotly';

const MIN = 60 * 1000;
const T0 = new Date(2026, 8, 28, 10, 0).getTime();
const at = (minutes: number): number => T0 + minutes * MIN;

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

// Mounts with a bound view, as `v-model:view` does
async function mountBound(
  view: GraphView,
  graphData = shallowRef([trace(60)]),
): Promise<Mounted & { views: GraphView[] }> {
  const views: GraphView[] = [];
  const m = await mountGraph(
    {
      view,
      'onUpdate:view': (v: GraphView) => {
        views.push(v);
        m.wrapper.setProps({ view: v });
      },
    },
    graphData,
  );
  return { ...m, views };
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

describe('PlotlyGraph view', () => {
  it('reports a zoom made in the graph', async () => {
    const { gd, graphData, views } = await mountBound(emptyGraphView());
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(10),
      'xaxis.range[1]': local(20),
    });
    expect(views).toEqual([{ range: [at(10), at(20)], follow: false }]);

    graphData.value = [trace(61)];
    await settle();
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);
    expect(views).toHaveLength(1);
  });

  it('shows the range it is given', async () => {
    const range: [number, number] = [at(10) + 7000, at(20) + 3000];
    const { gd, views } = await mountBound({ range, follow: false });
    expect(parsePlotlyRange(shownXRange(gd()))).toEqual(range);
    expect(views).toEqual([]);

    // Plotly writes GUI edits into its layout input, but not into the view
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(30),
      'xaxis.range[1]': local(40),
    });
    expect(range).toEqual([at(10) + 7000, at(20) + 3000]);
  });

  it('leaves the view alone after a y zoom', async () => {
    const { gd, graphData, views } = await mountBound(emptyGraphView());
    await guiRelayout(gd(), { 'yaxis.range[0]': 2, 'yaxis.range[1]': 4 });
    graphData.value = [trace(61)];
    await settle();

    expect(views).toEqual([]);
    expect(xAutorange(gd())).toBe(true);
    expect((gd() as any)._fullLayout.yaxis.range).toEqual([2, 4]);
  });

  it('shows all data after a double click', async () => {
    // The view is applied when the graph is created, as after a reload.
    // A double click must not return to that range.
    const { gd, views } = await mountBound({
      range: [at(10), at(20)],
      follow: false,
    });
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(30),
      'xaxis.range[1]': local(40),
    });

    await doubleClick(gd());
    await settle();
    expect(views).toEqual([
      { range: [at(30), at(40)], follow: false },
      emptyGraphView(),
    ]);
    expect(xAutorange(gd())).toBe(true);
    expect(shownXRange(gd())).toEqual([local(0), local(60)]);
  });

  it('applies the view again after a remount', async () => {
    const first = await mountBound(emptyGraphView());
    await guiRelayout(first.gd(), {
      'xaxis.range[0]': local(10),
      'xaxis.range[1]': local(20),
    });
    first.wrapper.unmount();

    const second = await mountBound(first.views[0]);
    expect(shownXRange(second.gd())).toEqual([local(10), local(20)]);
    expect(second.views).toEqual([]);
  });

  it('follows the newest data', async () => {
    const { gd, graphData, views } = await mountBound({
      range: [at(10), at(20)],
      follow: true,
    });
    expect(shownXRange(gd())).toEqual([local(50), local(60)]);

    graphData.value = [trace(61)];
    await settle();
    expect(shownXRange(gd())).toEqual([local(51), local(61)]);
    expect(views).toEqual([]);
  });

  it('stops following after a pan in the graph', async () => {
    const { gd, graphData, views } = await mountBound({
      range: [at(10), at(20)],
      follow: true,
    });
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(40),
      'xaxis.range[1]': local(50),
    });
    expect(views).toEqual([{ range: [at(40), at(50)], follow: false }]);

    graphData.value = [trace(61)];
    await settle();
    expect(shownXRange(gd())).toEqual([local(40), local(50)]);
  });

  it('shows all data when it turns static after a zoom of both axes', async () => {
    const { wrapper, graphData, gd } = await mountGraph();
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(10),
      'xaxis.range[1]': local(20),
      'yaxis.range[0]': 2,
      'yaxis.range[1]': 3,
    });
    await settle();

    await wrapper.setProps({ static: true });
    graphData.value = [trace(61)];
    await settle();
    expect((gd() as any)._context.staticPlot).toBe(true);
    expect(xAutorange(gd())).toBe(true);
    expect((gd() as any)._fullLayout.yaxis.autorange).toBe(true);
  });

  it('keeps a zoom without a bound view', async () => {
    const shapes = (minutes: number): Partial<Layout> => ({
      width: 400,
      height: 300,
      shapes: [
        { type: 'line', yref: 'paper', x0: at(minutes), x1: at(minutes) },
      ],
    });
    const { wrapper, graphData, gd } = await mountGraph({ layout: shapes(0) });
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(10),
      'xaxis.range[1]': local(20),
    });

    await wrapper.setProps({ layout: shapes(1) });
    graphData.value = [trace(61)];
    await settle();
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);

    await doubleClick(gd());
    graphData.value = [trace(62)];
    await settle();
    expect(xAutorange(gd())).toBe(true);
  });
});
