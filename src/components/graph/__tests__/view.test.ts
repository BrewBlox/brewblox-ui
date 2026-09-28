import { PlotData } from 'plotly.js';
import { describe, expect, it } from 'vitest';
import {
  emptyGraphView,
  fitYRanges,
  followRange,
  GraphRange,
  newestX,
  oldestX,
  parsePlotlyDate,
  parsePlotlyRange,
  relayoutView,
  viewAxis,
  viewRange,
} from '@/components/graph/view';

const MIN = 60 * 1000;
const T0 = new Date(2026, 8, 28, 10, 0).getTime();

const trace = (x: unknown[]): Partial<PlotData> => ({ x: x as number[] });

describe('parsePlotlyDate', () => {
  it('reads Plotly date strings as local time', () => {
    expect(parsePlotlyDate('2026-09-28 10:00')).toBe(
      new Date(2026, 8, 28, 10, 0).getTime(),
    );
    expect(parsePlotlyDate('2026-09-28 10:05:07')).toBe(
      new Date(2026, 8, 28, 10, 5, 7).getTime(),
    );
    expect(parsePlotlyDate('2026-09-28')).toBe(new Date(2026, 8, 28).getTime());
    expect(parsePlotlyDate('2026-01-02 03')).toBe(
      new Date(2026, 0, 2, 3).getTime(),
    );
    expect(parsePlotlyDate('2026-09-28T10:00')).toBe(
      new Date(2026, 8, 28, 10, 0).getTime(),
    );
  });

  it('keeps fractions of a second', () => {
    const base = new Date(2026, 8, 28, 10, 5, 7).getTime();
    expect(parsePlotlyDate('2026-09-28 10:05:07.5')).toBe(base + 500);
    expect(parsePlotlyDate('2026-09-28 10:05:07.25')).toBe(base + 250);
    expect(parsePlotlyDate('2026-09-28 10:05:07.1234')).toBeCloseTo(
      base + 123.4,
    );
  });

  it('passes numbers and dates through', () => {
    expect(parsePlotlyDate(T0)).toBe(T0);
    expect(parsePlotlyDate(new Date(T0))).toBe(T0);
  });

  it('rejects other values', () => {
    expect(parsePlotlyDate(NaN)).toBeNull();
    expect(parsePlotlyDate(Infinity)).toBeNull();
    expect(parsePlotlyDate(new Date('invalid'))).toBeNull();
    expect(parsePlotlyDate('')).toBeNull();
    expect(parsePlotlyDate('yesterday')).toBeNull();
    expect(parsePlotlyDate('2026-09-28 10:00Z')).toBeNull();
    expect(parsePlotlyDate(null)).toBeNull();
    expect(parsePlotlyDate(undefined)).toBeNull();
  });

  it('reads ranges', () => {
    expect(parsePlotlyRange(['2026-09-28 10:00', T0 + MIN])).toEqual([
      T0,
      T0 + MIN,
    ]);
    expect(parsePlotlyRange(['2026-09-28 10:00'])).toBeNull();
    expect(parsePlotlyRange(['2026-09-28 10:00', 'x'])).toBeNull();
    expect(parsePlotlyRange(undefined)).toBeNull();
  });
});

describe('relayoutView', () => {
  const shown: GraphRange = [T0, T0 + 60 * MIN];

  it('sets the range after a zoom or pan', () => {
    expect(
      relayoutView(
        {
          'xaxis.range[0]': '2026-09-28 10:10',
          'xaxis.range[1]': '2026-09-28 10:20:30',
        },
        shown,
      ),
    ).toEqual({ range: [T0 + 10 * MIN, T0 + 20.5 * MIN], follow: false });
  });

  it('takes a missing end from the shown range', () => {
    expect(
      relayoutView({ 'xaxis.range[1]': '2026-09-28 10:20' }, shown),
    ).toEqual({ range: [T0, T0 + 20 * MIN], follow: false });
    expect(
      relayoutView({ 'xaxis.range[0]': '2026-09-28 10:20' }, shown),
    ).toEqual({ range: [T0 + 20 * MIN, T0 + 60 * MIN], follow: false });
    expect(
      relayoutView({ 'xaxis.range[0]': '2026-09-28 10:20' }, null),
    ).toBeNull();
  });

  it('sets the range after a reset to a range', () => {
    expect(
      relayoutView(
        { 'xaxis.range': ['2026-09-28 10:10', '2026-09-28 10:20'] },
        shown,
      ),
    ).toEqual({ range: [T0 + 10 * MIN, T0 + 20 * MIN], follow: false });
  });

  it('accepts numbers', () => {
    expect(
      relayoutView(
        { 'xaxis.range[0]': T0 + MIN, 'xaxis.range[1]': T0 + 2 * MIN },
        shown,
      ),
    ).toEqual({ range: [T0 + MIN, T0 + 2 * MIN], follow: false });
  });

  it('clears the view after an autorange', () => {
    expect(relayoutView({ 'xaxis.autorange': true }, shown)).toEqual(
      emptyGraphView(),
    );
    expect(
      relayoutView({ 'xaxis.autorange': true, 'yaxis.autorange': true }, shown),
    ).toEqual(emptyGraphView());
  });

  it('ignores events that leave the x axis alone', () => {
    expect(
      relayoutView({ 'yaxis.range[0]': 1, 'yaxis.range[1]': 2 }, shown),
    ).toBeNull();
    expect(relayoutView({ 'yaxis.autorange': true }, shown)).toBeNull();
    expect(relayoutView({ dragmode: 'pan' }, shown)).toBeNull();
    expect(relayoutView({ autosize: true }, shown)).toBeNull();
    expect(relayoutView({ 'xaxis.autorange': false }, shown)).toBeNull();
  });

  it('reads the x range from events that change both axes', () => {
    expect(
      relayoutView(
        {
          'xaxis.range[0]': '2026-09-28 10:10',
          'xaxis.range[1]': '2026-09-28 10:20',
          'yaxis.range[0]': 1,
          'yaxis.range[1]': 2,
        },
        shown,
      ),
    ).toEqual({ range: [T0 + 10 * MIN, T0 + 20 * MIN], follow: false });
  });

  it('ignores ranges it cannot read', () => {
    expect(
      relayoutView(
        { 'xaxis.range[0]': 'x', 'xaxis.range[1]': '2026-09-28 10:20' },
        shown,
      ),
    ).toBeNull();
    expect(
      relayoutView(
        {
          'xaxis.range[0]': '2026-09-28 10:20',
          'xaxis.range[1]': '2026-09-28 10:20',
        },
        shown,
      ),
    ).toBeNull();
  });

  it('orders a reversed range', () => {
    expect(
      relayoutView(
        {
          'xaxis.range[0]': '2026-09-28 10:20',
          'xaxis.range[1]': '2026-09-28 10:10',
        },
        shown,
      ),
    ).toEqual({ range: [T0 + 10 * MIN, T0 + 20 * MIN], follow: false });
  });
});

describe('follow', () => {
  const range: GraphRange = [T0, T0 + 10 * MIN];

  it('finds the newest point of all traces', () => {
    expect(
      newestX([
        trace([T0, T0 + 5 * MIN]),
        trace([]),
        {},
        trace([T0, T0 + 7 * MIN]),
      ]),
    ).toBe(T0 + 7 * MIN);
    expect(newestX([trace(['2026-09-28 10:30'])])).toBe(T0 + 30 * MIN);
    expect(newestX([trace([]), {}])).toBeNull();
    expect(newestX([])).toBeNull();
  });

  it('finds the oldest point of all traces', () => {
    expect(
      oldestX([
        trace([T0 + 3 * MIN, T0 + 5 * MIN]),
        trace([]),
        {},
        trace([T0 + 2 * MIN, T0 + 7 * MIN]),
      ]),
    ).toBe(T0 + 2 * MIN);
    expect(oldestX([trace(['2026-09-28 10:30'])])).toBe(T0 + 30 * MIN);
    expect(oldestX([trace([]), {}])).toBeNull();
  });

  it('ends the window at the newest point, with the width of the range', () => {
    const data = [trace([T0, T0 + 55 * MIN]), trace([T0, T0 + 60 * MIN])];
    expect(followRange(range, data)).toEqual([T0 + 50 * MIN, T0 + 60 * MIN]);
  });

  it('ends the window now if there is no data', () => {
    expect(followRange(range, [], T0 + 30 * MIN)).toEqual([
      T0 + 20 * MIN,
      T0 + 30 * MIN,
    ]);
  });

  it('shows the range of a view', () => {
    const data = [trace([T0, T0 + 60 * MIN])];
    expect(viewRange(emptyGraphView(), data)).toBeNull();
    expect(viewRange({ range, follow: false }, data)).toEqual(range);
    expect(viewRange({ range, follow: true }, data)).toEqual([
      T0 + 50 * MIN,
      T0 + 60 * MIN,
    ]);
  });
});

describe('viewAxis', () => {
  it('always sets autorange', () => {
    const range: GraphRange = [T0, T0 + MIN];
    const axis = viewAxis(range);
    expect(axis).toEqual({ autorange: false, range });
    expect(axis.range).not.toBe(range);
    expect(viewAxis(null)).toEqual({ autorange: true });
  });
});

describe('fitYRanges', () => {
  const points = (
    minutes: number[],
    values: number[],
    extra: Partial<PlotData> = {},
  ): Partial<PlotData> => ({
    x: minutes.map((m) => T0 + m * MIN),
    y: values,
    ...extra,
  });
  const window: GraphRange = [T0 + 10 * MIN, T0 + 20 * MIN];

  it('fits the points inside the window, per y axis', () => {
    expect(
      fitYRanges(
        [
          points([0, 10, 15, 20, 30], [100, 2, 12, 7, -50]),
          points([5, 12, 18], [1, 40, 60], { yaxis: 'y2' }),
        ],
        window,
      ),
    ).toEqual({ yaxis: [1.5, 12.5], yaxis2: [39, 61] });
  });

  it('leaves out hidden traces, and values that are not finite', () => {
    expect(
      fitYRanges(
        [
          points([10, 20], [0, 10], { uid: 'a' }),
          points([12, 14, 16], [4, NaN, 6], { uid: 'b' }),
        ],
        window,
        new Set(['a']),
      ),
    ).toEqual({ yaxis: [3.9, 6.1] });
  });

  it('gives a flat line a margin of 1, and no range without points', () => {
    expect(fitYRanges([points([12], [20])], window)).toEqual({
      yaxis: [19, 21],
    });
    expect(fitYRanges([points([0, 30], [1, 2])], window)).toEqual({});
  });
});
