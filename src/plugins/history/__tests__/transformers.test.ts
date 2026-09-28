import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_GRAPH_POINTS } from '../const';
import {
  graphSourceTransformer,
  metricsSourceTransformer,
} from '../store/transformers';
import {
  GraphSource,
  MetricsSource,
  QueryParams,
  TimeSeriesRange,
  TimeSeriesRangesResult,
} from '../types';

// 2026-09-28T12:00:00Z, in seconds
const NOW = 1790596800;

const graphSource = (params: QueryParams = {}): GraphSource => ({
  id: 'graph',
  command: 'ranges',
  params,
  fields: ['sparkey/sensor/value[degC]', 'sparkey/pwm/setting'],
  renames: {},
  axes: {},
  colors: {},
  precision: {},
  values: {},
  truncated: false,
});

const range = (name: string, values: [number, number][]): TimeSeriesRange => ({
  metric: { __name__: name },
  values: values.map(([ts, v]) => [ts, `${v}`]),
});

const message = (
  initial: boolean,
  ranges: TimeSeriesRange[],
): TimeSeriesRangesResult => ({ initial, ranges });

const SENSOR = 'sparkey/sensor/value[degC]';
const PWM = 'sparkey/pwm/setting';

describe('graphSourceTransformer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW * 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('replaces the values on an initial message with ranges', () => {
    const source = graphSource();
    graphSourceTransformer(
      source,
      message(true, [
        range(SENSOR, [
          [NOW - 20, 20],
          [NOW - 10, 21],
        ]),
        range(PWM, [[NOW - 10, 50]]),
      ]),
    );
    graphSourceTransformer(
      source,
      message(true, [range(SENSOR, [[NOW - 5, 22]])]),
    );

    expect(Object.keys(source.values)).toEqual([SENSOR]);
    expect(source.values[SENSOR].x).toEqual([(NOW - 5) * 1000]);
    expect(source.values[SENSOR].y).toEqual([22]);
    expect(source.values[SENSOR].name).toContain('22.00');
  });

  it('appends a follow-up and leaves the other fields alone', () => {
    const source = graphSource();
    graphSourceTransformer(
      source,
      message(true, [
        range(SENSOR, [[NOW - 20, 20]]),
        range(PWM, [[NOW - 20, 50]]),
      ]),
    );
    const pwm = source.values[PWM];

    graphSourceTransformer(
      source,
      message(false, [
        range(SENSOR, [
          [NOW - 10, 21],
          [NOW - 5, 22],
        ]),
      ]),
    );

    expect(source.values[SENSOR].x).toEqual([
      (NOW - 20) * 1000,
      (NOW - 10) * 1000,
      (NOW - 5) * 1000,
    ]);
    expect(source.values[SENSOR].y).toEqual([20, 21, 22]);
    expect(source.values[SENSOR].name).toContain('22.00');
    expect(source.values[PWM]).toBe(pwm);
  });

  it('keeps what Plotly set on a trace when appending', () => {
    const source = graphSource();
    graphSourceTransformer(
      source,
      message(true, [range(SENSOR, [[NOW - 20, 20]])]),
    );
    source.values[SENSOR].visible = 'legendonly';

    graphSourceTransformer(
      source,
      message(false, [range(SENSOR, [[NOW - 10, 21]])]),
    );

    expect(source.values[SENSOR].visible).toBe('legendonly');
  });

  it('clears on an initial message that lists every field without points', () => {
    // History sends this after its clock went back
    const source = graphSource();
    graphSourceTransformer(
      source,
      message(true, [range(SENSOR, [[NOW - 20, 20]])]),
    );

    graphSourceTransformer(
      source,
      message(true, [range(SENSOR, []), range(PWM, [])]),
    );

    expect(source.values[SENSOR].x).toEqual([]);
    expect(source.values[PWM].x).toEqual([]);
    expect(source.values[SENSOR].name).toContain('--.--');
    expect(source.values[PWM].name).toContain('--.--');
  });

  it('shows placeholders without decimals for a precision of 0', () => {
    const source = graphSource();
    source.precision = { [SENSOR]: 0 };
    graphSourceTransformer(source, message(true, [range(SENSOR, [])]));

    expect(source.values[SENSOR].name).toContain('---');
    expect(source.values[SENSOR].name).not.toContain('--.--');
  });

  it('clears on an initial message without ranges', () => {
    // History leaves out the fields without points in the window,
    // and sends no ranges at all when none of them has points
    const source = graphSource();
    graphSourceTransformer(
      source,
      message(true, [range(SENSOR, [[NOW - 20, 20]])]),
    );

    graphSourceTransformer(source, message(true, []));

    expect(source.values).toEqual({});
  });

  it('keeps the values on a follow-up without ranges', () => {
    const source = graphSource();
    graphSourceTransformer(
      source,
      message(true, [range(SENSOR, [[NOW - 20, 20]])]),
    );

    graphSourceTransformer(source, message(false, []));

    expect(source.values[SENSOR].y).toEqual([20]);
  });

  it('marks the source truncated at the point limit, and not after a clear', () => {
    const source = graphSource();
    const points: [number, number][] = Array.from(
      { length: MAX_GRAPH_POINTS },
      (_, idx) => [NOW - MAX_GRAPH_POINTS + idx, idx],
    );
    graphSourceTransformer(source, message(true, [range(SENSOR, points)]));
    expect(source.values[SENSOR].x.length).toBe(MAX_GRAPH_POINTS);
    expect(source.truncated).toBe(true);

    graphSourceTransformer(source, message(true, []));
    expect(source.truncated).toBe(false);
  });

  it('drops the oldest points past the point limit', () => {
    const source = graphSource();
    const points: [number, number][] = Array.from(
      { length: MAX_GRAPH_POINTS - 1 },
      (_, idx) => [NOW - MAX_GRAPH_POINTS + idx, idx],
    );
    graphSourceTransformer(source, message(true, [range(SENSOR, points)]));
    expect(source.truncated).toBe(false);

    graphSourceTransformer(
      source,
      message(false, [
        range(SENSOR, [
          [NOW, 9998],
          [NOW + 1, 9999],
        ]),
      ]),
    );

    const { x, y } = source.values[SENSOR];
    expect(x.length).toBe(MAX_GRAPH_POINTS);
    expect(y[0]).toBe(1);
    expect(y[y.length - 1]).toBe(9999);
    expect(source.truncated).toBe(true);
  });

  it('replaces values outside the minimum and maximum with gaps', () => {
    const source = graphSource();
    source.min = { [SENSOR]: 10 };
    source.max = { [SENSOR]: 30 };
    graphSourceTransformer(
      source,
      message(true, [
        range(SENSOR, [
          [NOW - 30, 5],
          [NOW - 20, 20],
          [NOW - 10, 35],
        ]),
      ]),
    );

    expect(source.values[SENSOR].y).toEqual([NaN, 20, NaN]);
  });

  it('drops points that fell out of a live window', () => {
    const source = graphSource({ duration: '10m' });
    graphSourceTransformer(
      source,
      message(true, [
        range(SENSOR, [
          [NOW - 590, 20],
          [NOW - 300, 21],
        ]),
      ]),
    );

    graphSourceTransformer(
      source,
      message(false, [range(SENSOR, [[NOW + 55, 22]])]),
    );

    expect(source.values[SENSOR].y).toEqual([21, 22]);
  });

  it('keeps every point of a window with a start', () => {
    const source = graphSource({
      start: new Date((NOW - 600) * 1000).toISOString(),
      duration: '10m',
    });
    graphSourceTransformer(
      source,
      message(true, [
        range(SENSOR, [
          [NOW - 590, 20],
          [NOW - 300, 21],
        ]),
      ]),
    );

    graphSourceTransformer(
      source,
      message(false, [range(SENSOR, [[NOW + 595, 22]])]),
    );

    expect(source.values[SENSOR].y).toEqual([20, 21, 22]);
  });

  it('empties a line once all its points fell out of a live window', () => {
    const source = graphSource({ duration: '10m' });
    graphSourceTransformer(
      source,
      message(true, [
        range(SENSOR, [[NOW - 60, 20]]),
        range(PWM, [[NOW - 500, 50]]),
      ]),
    );

    graphSourceTransformer(
      source,
      message(false, [range(SENSOR, [[NOW + 195, 21]])]),
    );

    expect(source.values[SENSOR].y).toEqual([20, 21]);
    expect(source.values[PWM].x).toEqual([]);
    expect(source.values[PWM].y).toEqual([]);
    expect(source.values[PWM].name).toContain('--.--');
  });

  it('trims a live window from its newest point when the browser clock is ahead', () => {
    // A Brewblox host without a clock source can run behind the device that shows the graph
    vi.setSystemTime((NOW + 900) * 1000);
    const source = graphSource({ duration: '10m' });
    graphSourceTransformer(
      source,
      message(true, [
        range(SENSOR, [
          [NOW - 595, 20],
          [NOW - 300, 21],
          [NOW - 5, 22],
        ]),
      ]),
    );
    expect(source.values[SENSOR].y).toEqual([20, 21, 22]);

    graphSourceTransformer(
      source,
      message(false, [range(SENSOR, [[NOW + 10, 23]])]),
    );
    expect(source.values[SENSOR].y).toEqual([21, 22, 23]);
  });

  it('trims a live window from its newest point when the browser clock is behind', () => {
    vi.setSystemTime((NOW - 900) * 1000);
    const source = graphSource({ duration: '10m' });
    graphSourceTransformer(
      source,
      message(true, [
        range(SENSOR, [
          [NOW - 595, 20],
          [NOW - 5, 21],
        ]),
      ]),
    );

    graphSourceTransformer(
      source,
      message(false, [range(SENSOR, [[NOW + 10, 22]])]),
    );
    expect(source.values[SENSOR].y).toEqual([21, 22]);
  });
});

describe('metricsSourceTransformer', () => {
  it('replaces the values', () => {
    const source: MetricsSource = {
      id: 'metrics',
      command: 'metrics',
      params: {},
      fields: [SENSOR],
      renames: {},
      updated: new Date(0),
      values: [],
    };

    metricsSourceTransformer(source, {
      metrics: [
        {
          metric: SENSOR,
          value: 20.5,
          timestamp: '2026-09-28T12:00:00.123000Z',
        },
      ],
    });

    expect(source.values).toEqual([
      {
        field: SENSOR,
        time: new Date('2026-09-28T12:00:00.123Z'),
        value: 20.5,
      },
    ]);
    expect(source.updated.getTime()).toBeGreaterThan(0);
  });
});
