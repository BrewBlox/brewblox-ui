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
import {
  doubleClick,
  guiRelayout,
  guiRestyle,
  shownXRange,
  traceVisibility,
} from '../../../../test/plotly';

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
  graphId: string;
  wrapper: VueWrapper;
  send: (initial: boolean, minutes: number[]) => Promise<void>;
  reload: () => Promise<void>;
  gd: () => HTMLElement;
  followButton: () => DOMWrapper<Element> | undefined;
  refineButton: () => DOMWrapper<Element> | undefined;
  refineSource: () => GraphSource | null;
  sendRefined: (minutes: number[]) => Promise<void>;
}

const mounted: VueWrapper[] = [];

async function mountGraph(
  props: Record<string, unknown> = {},
  minutes = range(0, 60),
  graphId = nanoid(),
): Promise<Mounted> {
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

  // The refined window: its own stream, answered once, here with values 100 + minute
  const refineIds = (): string[] =>
    Object.keys(historyStore.sources).filter((id) =>
      id.startsWith(`${graphId}:refine:`),
    );
  const refineSource = (): GraphSource | null => {
    const ids = refineIds();
    expect(ids.length).toBeLessThanOrEqual(1);
    return ids.length
      ? (historyStore.sources[ids[0]].value as GraphSource)
      : null;
  };
  const sendRefined = async (minutes: number[]): Promise<void> => {
    const ref = historyStore.sources[refineIds()[0]];
    graphSourceTransformer(ref.value as GraphSource, {
      initial: true,
      ranges: ['a', 'b'].map((key) => ({
        metric: { __name__: key },
        values: minutes.map((m) => [at(m) / 1000, `${100 + m}`]),
      })),
    });
    triggerRef(ref);
    await settle();
  };

  // What happens when the graph gets too many points
  const reload = async (): Promise<void> => {
    source().value.truncated = true;
    triggerRef(source());
    await settle();
  };

  // A graph with a shared source shows what the owner of the source gets
  if (!props.sharedSources) {
    await send(true, minutes);
  }

  return {
    graphId,
    wrapper,
    send,
    reload,
    gd: () => wrapper.find('.js-plotly-plot').element as HTMLElement,
    followButton: () =>
      wrapper
        .findAll('.q-btn')
        .find((btn) => btn.find('.mdi-arrow-collapse-right').exists()),
    refineButton: () =>
      wrapper
        .findAll('.q-btn')
        .find((btn) => btn.find('.mdi-magnify-plus-outline').exists()),
    refineSource,
    sendRefined,
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

  it('shows the value at the right edge of the window in the legend', async () => {
    // The value at minute m is m % 7
    const { gd, send, followButton } = await mountGraph();
    const names = (): string[] => (gd() as any).data.map((t: any) => t.name);
    expect(names()[0]).toContain('4.00');

    await zoom(gd(), 10, 20);
    expect(names()[0]).toContain('6.00');
    await send(false, [61]);
    expect(names()[0]).toContain('6.00');

    // Before the first point, there is no value
    await zoom(gd(), -20, -10);
    expect(names()[0]).toContain('--.--');

    await zoom(gd(), 10, 20);
    await followButton()!.trigger('click');
    await settle();
    expect(names()[0]).toContain('5.00');
    await send(false, [62]);
    expect(names()[0]).toContain('6.00');
  });

  it('keeps a hidden legend entry through follow-ups and a reconnect', async () => {
    const { gd, send, graphId } = await mountGraph();
    await guiRestyle(gd(), { visible: 'legendonly' }, [1]);
    expect(traceVisibility(gd())).toEqual([true, 'legendonly']);

    await send(false, [61]);
    await send(false, [62]);
    // A reconnect starts the stream again with an initial message
    await send(true, range(0, 63));
    expect(traceVisibility(gd())).toEqual([true, 'legendonly']);

    // What Plotly writes into its data stays out of the source
    const source = useHistoryStore().sourceById<GraphSource>(graphId)!;
    expect(Object.values(source.value.values).map((v) => v.visible)).toEqual([
      undefined,
      undefined,
    ]);

    await guiRestyle(gd(), { visible: true }, [1]);
    await send(false, [64]);
    await send(true, range(0, 65));
    expect(traceVisibility(gd())).toEqual([true, true]);
  });

  it('keeps its own legend in graphs that share a source', async () => {
    const owner = await mountGraph();
    const shared = await mountGraph({ sharedSources: true }, [], owner.graphId);
    await settle();

    await guiRestyle(shared.gd(), { visible: 'legendonly' }, [0]);
    await owner.send(false, [61]);
    expect(traceVisibility(shared.gd())).toEqual(['legendonly', true]);
    expect(traceVisibility(owner.gd())).toEqual([true, true]);
  });

  it('shows a refined window inside the live data', async () => {
    const live = range(0, 60).filter((m) => m % 5 === 0);
    const { gd, refineButton, refineSource, sendRefined } = await mountGraph(
      {},
      live,
    );
    const minutes = (): number[] =>
      (gd() as any).data[0].x.map((x: number) => (x - T0) / MIN);
    const name = (): string => (gd() as any).data[0].name;
    expect(refineButton()).toBeUndefined();

    await zoom(gd(), 10, 20);
    await refineButton()!.trigger('click');
    await settle();
    expect(refineSource()!.params).toEqual({
      start: new Date(at(10)).toISOString(),
      end: new Date(at(20)).toISOString(),
    });
    expect(refineButton()!.classes()).toContain('text-primary');

    await sendRefined(range(10, 20));
    expect(minutes()).toEqual([
      0,
      5,
      ...range(10, 20),
      25,
      30,
      ...live.slice(7),
    ]);
    expect(shownXRange(gd())).toEqual([local(10), local(20)]);
    expect(name()).toContain('120.00');
  });

  it('fits the y axis to a refined window', async () => {
    const { gd, refineButton, sendRefined } = await mountGraph();
    const yaxis = (): any => (gd() as any)._fullLayout.yaxis;

    // A box zoom that sets the y range too
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(10),
      'xaxis.range[1]': local(20),
      'yaxis.range[0]': 0,
      'yaxis.range[1]': 5,
    });
    await settle();
    await refineButton()!.trigger('click');
    await settle();
    // The refined values are 100 + minute
    await sendRefined(range(10, 20));
    expect(yaxis().range).toEqual([109.5, 120.5]);

    // A diagonal box zoom inside it: the y axis fits the new window, not the box
    await guiRelayout(gd(), {
      'xaxis.range[0]': local(12),
      'xaxis.range[1]': local(14),
      'yaxis.range[0]': 0,
      'yaxis.range[1]': 5,
    });
    await settle();
    expect(refineButton()!.classes()).not.toContain('text-primary');
    expect(yaxis().range.map((v: number) => +v.toFixed(2))).toEqual([
      111.9, 114.1,
    ]);

    // Showing all data ends the refinement, and the y axis fits all data again
    await doubleClick(gd());
    await settle();
    expect(yaxis().autorange).toBe(true);
  });

  it('refines again after another zoom, and stops on a click or double click', async () => {
    const { gd, refineButton, refineSource, sendRefined } = await mountGraph();
    const refineOn = async (): Promise<void> => {
      await refineButton()!.trigger('click');
      await settle();
    };
    await zoom(gd(), 10, 20);
    await refineOn();
    await sendRefined(range(10, 20));

    // A zoom inside the refined window can be refined further
    await zoom(gd(), 12, 14);
    expect(refineButton()!.classes()).not.toContain('text-primary');
    await refineOn();
    expect(refineSource()!.params.start).toBe(new Date(at(12)).toISOString());
    expect(refineButton()!.classes()).toContain('text-primary');

    // Turned off: the live data only
    await refineOn();
    expect(refineSource()).toBeNull();
    expect(refineButton()!.classes()).not.toContain('text-primary');

    await refineOn();
    expect(refineSource()).not.toBeNull();
    await doubleClick(gd());
    await settle();
    expect(refineSource()).toBeNull();
    expect(refineButton()).toBeUndefined();
  });

  it('ends the refinement when the query changes or the graph goes away', async () => {
    const { gd, wrapper, refineButton, refineSource } = await mountGraph();
    await zoom(gd(), 10, 20);
    await refineButton()!.trigger('click');
    await settle();

    await wrapper.setProps({ config: graphConfig({ duration: '2h' }) });
    await settle();
    expect(refineSource()).toBeNull();

    const other = await mountGraph();
    await zoom(other.gd(), 10, 20);
    await other.refineButton()!.trigger('click');
    await settle();
    expect(other.refineSource()).not.toBeNull();
    other.wrapper.unmount();
    expect(other.refineSource()).toBeNull();
  });

  it('waits for the live data when it reloads while refined', async () => {
    const { gd, send, reload, wrapper, refineButton, sendRefined } =
      await mountGraph();
    await zoom(gd(), 10, 20);
    await refineButton()!.trigger('click');
    await settle();
    await sendRefined(range(10, 20));

    // Not the refined stretch alone, as if it were all data
    await reload();
    expect(wrapper.find('.js-plotly-plot').exists()).toBe(false);

    await send(true, range(0, 61));
    const minutes = (gd() as any).data[0].x.map((x: number) => (x - T0) / MIN);
    expect(minutes).toEqual(range(0, 61));
    expect((gd() as any).data[0].y.slice(10, 21)).toEqual(
      range(10, 20).map((m) => 100 + m),
    );
  });

  it('does not fetch the refined window again after a query edit', async () => {
    const { gd, wrapper, refineButton, refineSource } = await mountGraph();
    const store = useHistoryStore();
    await zoom(gd(), 10, 20);
    await refineButton()!.trigger('click');
    await settle();
    const create = vi.spyOn(store, 'createGraphSource');

    // The graph widget reloads the data after every config edit
    await wrapper.setProps({
      config: graphConfig({ duration: '2h' }),
      sourceRevision: new Date(),
    });
    await settle();
    expect(refineSource()).toBeNull();
    expect(create.mock.calls.map((call) => call[0])).not.toContainEqual(
      expect.stringContaining(':refine:'),
    );
    create.mockRestore();
  });

  it('refines closed windows too, but not static graphs', async () => {
    const closed = await mountGraph({
      config: graphConfig({
        start: new Date(at(0)).toISOString(),
        end: new Date(at(60)).toISOString(),
      }),
    });
    await zoom(closed.gd(), 10, 20);
    expect(closed.refineButton()).toBeDefined();

    await closed.wrapper.setProps({ static: true });
    await settle();
    expect(closed.refineButton()).toBeUndefined();
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
