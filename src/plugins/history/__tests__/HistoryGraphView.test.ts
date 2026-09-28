import { DOMWrapper, mount, VueWrapper } from '@vue/test-utils';
import { nanoid } from 'nanoid';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { triggerRef } from 'vue';
import PlotlyGraph from '@/components/graph/PlotlyGraph.vue';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import HistoryGraphControls from '@/plugins/history/components/HistoryGraphControls.vue';
import { useHistoryStore } from '@/plugins/history/store';
import { graphSourceTransformer } from '@/plugins/history/store/transformers';
import { GraphConfig, GraphSource, QueryParams } from '@/plugins/history/types';
import { emptyGraphConfig, isOpenEndedQuery } from '@/plugins/history/utils';
import { notify } from '@/utils/notify';
import { guiRelayout, shownXRange } from '../../../../test/plotly';

const MIN = 60 * 1000;
const T0 = new Date(2026, 8, 28, 10, 0).getTime();
const at = (minutes: number): number => T0 + minutes * MIN;

// Plotly reports date axis values in local time
const local = (minutes: number): string => {
  const d = new Date(at(minutes));
  const pad = (v: number): string => `${v}`.padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    ` ${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
};

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

// Longer than the debounced source reset and render, and Plotly draws asynchronously
const settle = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 200));

const graphConfig = (params: QueryParams = {}): GraphConfig => ({
  ...emptyGraphConfig(),
  params,
  fields: ['a', 'b'],
});

interface Mounted {
  wrapper: VueWrapper;
  send: (initial: boolean, minutes: number[]) => Promise<void>;
  reload: () => Promise<void>;
  gd: () => HTMLElement;
  followButton: () => DOMWrapper<Element> | undefined;
}

const mounted: VueWrapper[] = [];

async function mountGraph(
  props: Record<string, unknown> = {},
  minutes = range(0, 60),
): Promise<Mounted> {
  const graphId = nanoid();
  const historyStore = useHistoryStore();
  const source = (): any => historyStore.sourceById<GraphSource>(graphId)!;

  const wrapper = mount(HistoryGraph, {
    props: { graphId, config: graphConfig(), ...props },
    global: {
      components: { PlotlyGraph, HistoryGraphControls },
      stubs: {
        ActionMenu: true,
        ActionSubmenu: true,
        ActionItem: true,
        GraphRangeSubmenu: true,
        ButtonsTeleport: true,
      },
    },
    attachTo: document.body,
  });
  mounted.push(wrapper);

  // What the history store does with a message from the history service
  const send = async (initial: boolean, minutes: number[]): Promise<void> => {
    graphSourceTransformer(source().value, {
      initial,
      ranges: ['a', 'b'].map((key) => ({
        metric: { __name__: key },
        values: minutes.map((m) => [at(m) / 1000, `${m % 7}`]),
      })),
    });
    triggerRef(source());
    await settle();
  };

  // What happens when the graph gets too many points
  const reload = async (): Promise<void> => {
    source().value.truncated = true;
    triggerRef(source());
    await settle();
  };

  await send(true, minutes);

  return {
    wrapper,
    send,
    reload,
    gd: () => wrapper.find('.js-plotly-plot').element as HTMLElement,
    followButton: () =>
      wrapper
        .findAll('.q-btn')
        .find((btn) => btn.find('.mdi-arrow-collapse-right').exists()),
  };
}

async function zoom(gd: HTMLElement, from: number, to: number): Promise<void> {
  await guiRelayout(gd, {
    'xaxis.range[0]': local(from),
    'xaxis.range[1]': local(to),
  });
  await settle();
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

describe('isOpenEndedQuery', () => {
  it('is true for queries that keep getting new data', () => {
    expect(isOpenEndedQuery({})).toBe(true);
    expect(isOpenEndedQuery({ duration: '1h' })).toBe(true);
    expect(isOpenEndedQuery({ start: '2026-09-28T10:00:00Z' })).toBe(true);
  });

  it('is false for closed windows', () => {
    const start = '2026-09-28T10:00:00Z';
    const end = '2026-09-28T12:00:00Z';
    expect(isOpenEndedQuery({ start, end })).toBe(false);
    expect(isOpenEndedQuery({ start, duration: '1h' })).toBe(false);
    expect(isOpenEndedQuery({ duration: '1h', end })).toBe(false);
    expect(isOpenEndedQuery({ end })).toBe(false);
  });
});

describe('HistoryGraph view', () => {
  it('keeps the zoom when the data is reloaded', async () => {
    const { gd, send, reload, wrapper } = await mountGraph();
    await zoom(gd(), 10, 20);

    await reload();
    expect(wrapper.find('.js-plotly-plot').exists()).toBe(false);

    await send(true, range(0, 61));
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);
  });

  it('keeps the zoom after a layout edit, but not after a query edit', async () => {
    const { gd, send, wrapper } = await mountGraph();
    await zoom(gd(), 10, 20);

    // The graph widget reloads the data after every config edit
    await wrapper.setProps({
      config: { ...graphConfig(), layout: { yaxis: { range: [0, 10] } } },
      sourceRevision: new Date(),
    });
    await settle();
    expect(wrapper.find('.js-plotly-plot').exists()).toBe(false);
    await send(true, range(0, 60));
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);

    await wrapper.setProps({
      config: graphConfig({ duration: '1d' }),
      sourceRevision: new Date(),
    });
    await settle();
    await send(true, range(0, 60));
    expect((gd() as any)._fullLayout.xaxis.autorange).toBe(true);
  });

  it('clears the zoom when the fields change', async () => {
    const { gd, wrapper, followButton } = await mountGraph();
    await zoom(gd(), 10, 20);
    expect(followButton()).toBeDefined();

    await wrapper.setProps({ config: { ...graphConfig(), fields: ['a'] } });
    await settle();
    expect(followButton()).toBeUndefined();
  });

  it('follows the newest data', async () => {
    const { gd, send, followButton } = await mountGraph();
    expect(followButton()).toBeUndefined();

    await zoom(gd(), 10, 20);
    expect(followButton()!.classes()).not.toContain('text-primary');

    await followButton()!.trigger('click');
    await settle();
    expect(followButton()!.classes()).toContain('text-primary');
    expect(shownXRange(gd())).toEqual([local(50), local(60)]);

    await send(false, [61]);
    expect(shownXRange(gd())).toEqual([local(51), local(61)]);

    // Turning it off keeps the window that is shown
    await followButton()!.trigger('click');
    await settle();
    expect(followButton()!.classes()).not.toContain('text-primary');
    await send(false, [62]);
    expect(shownXRange(gd())).toEqual([local(51), local(61)]);
  });

  it('stops following after a zoom in the graph', async () => {
    const { gd, send, followButton } = await mountGraph();
    await zoom(gd(), 10, 20);
    await followButton()!.trigger('click');
    await settle();

    await zoom(gd(), 30, 40);
    expect(followButton()!.classes()).not.toContain('text-primary');
    await send(false, [61]);
    expect(shownXRange(gd())).toEqual([local(30), local(40)]);
  });

  it('keeps following through a reload', async () => {
    const { gd, send, reload, followButton } = await mountGraph();
    await zoom(gd(), 10, 20);
    await followButton()!.trigger('click');
    await settle();

    await reload();
    await send(true, range(0, 65));
    expect(shownXRange(gd())).toEqual([local(55), local(65)]);
  });

  it('keeps the window that was shown when Follow is toggled during a reload', async () => {
    const { gd, send, reload, followButton, wrapper } = await mountGraph();
    const toggle = async (): Promise<void> => {
      await followButton()!.trigger('click');
      await settle();
    };
    await zoom(gd(), 10, 20);
    await toggle();
    expect(shownXRange(gd())).toEqual([local(50), local(60)]);

    // The graph is not shown, and has no data to follow
    await reload();
    expect(wrapper.find('.js-plotly-plot').exists()).toBe(false);
    await toggle();
    await send(true, range(0, 65));
    expect(followButton()!.classes()).not.toContain('text-primary');
    expect(shownXRange(gd())).toEqual([local(50), local(60)]);

    // Turned on and off again before the graph is shown
    await reload();
    await toggle();
    await toggle();
    await send(true, range(0, 66));
    expect(shownXRange(gd())).toEqual([local(50), local(60)]);

    // Turned on before the graph is shown
    await reload();
    await toggle();
    await send(true, range(0, 67));
    expect(shownXRange(gd())).toEqual([local(57), local(67)]);
  });

  it('shows all data once a live window moved past a fixed zoom', async () => {
    const { gd, send, followButton } = await mountGraph({
      config: graphConfig({ duration: '60m' }),
    });
    await zoom(gd(), 2, 8);

    // The zoom still has data
    await send(false, range(61, 65));
    expect(shownXRange(gd())).toEqual([local(2), local(8)]);

    // The window starts after the zoom
    await send(false, range(66, 70));
    expect((gd() as any)._fullLayout.xaxis.autorange).toBe(true);
    expect(followButton()).toBeUndefined();
  });

  it('keeps a fixed zoom on a gap of a live window', async () => {
    const { gd, send } = await mountGraph(
      { config: graphConfig({ duration: '60m' }) },
      [...range(0, 10), ...range(30, 60)],
    );
    await zoom(gd(), 15, 25);
    await send(false, range(61, 65));
    expect(shownXRange(gd())).toEqual([local(15), local(25)]);
  });

  it('shows all data when the graph turns static', async () => {
    const { gd, send, wrapper } = await mountGraph();
    await zoom(gd(), 10, 20);

    await wrapper.setProps({ static: true });
    await settle();
    await send(false, [61]);
    expect((gd() as any)._context.staticPlot).toBe(true);
    expect((gd() as any)._fullLayout.xaxis.autorange).toBe(true);

    // Nothing to return to when it can be zoomed again
    await wrapper.setProps({ static: false });
    await settle();
    await send(false, [62]);
    expect((gd() as any)._fullLayout.xaxis.autorange).toBe(true);
  });

  it('offers Follow only for graphs that get new data', async () => {
    const closed = await mountGraph({
      config: graphConfig({
        start: new Date(at(0)).toISOString(),
        end: new Date(at(60)).toISOString(),
      }),
    });
    await zoom(closed.gd(), 10, 20);
    expect(closed.followButton()).toBeUndefined();

    const live = await mountGraph();
    await zoom(live.gd(), 10, 20);
    expect(live.followButton()).toBeDefined();

    await live.wrapper.setProps({ static: true });
    await settle();
    expect(live.followButton()).toBeUndefined();
  });
});
