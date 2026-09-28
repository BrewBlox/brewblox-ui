import Plotly, { Layout } from 'plotly.js';
import { describe, expect, it } from 'vitest';
import {
  graphSourceTransformer,
  traceUid,
} from '@/plugins/history/store/transformers';
import { GraphSource, TimeSeriesRange } from '@/plugins/history/types';
import { guiRestyle, plotDiv, traceVisibility } from '../../../../test/plotly';

const T0 = Date.UTC(2026, 8, 28, 10) / 1000;

const source = (): GraphSource => ({
  id: 'graph',
  command: 'ranges',
  params: {},
  fields: ['a', 'b', 'c'],
  renames: {},
  axes: {},
  colors: {},
  precision: {},
  values: {},
  truncated: false,
});

const range = (key: string): TimeSeriesRange => ({
  metric: { __name__: key },
  values: [
    [T0, '1'],
    [T0 + 60, '2'],
  ],
});

// The layout PlotlyGraph renders keeps GUI edits with a constant uirevision
const layout = (): Partial<Layout> => ({
  width: 400,
  height: 300,
  uirevision: 'graph',
});

describe('graph trace identity', () => {
  it('draws fields whose names are not valid in CSS selectors', async () => {
    // Plotly builds selectors and element ids from the trace uid
    const src = source();
    const sensor = 'sparkey/Ferment Fridge Sensor/value[degC]';
    const setting = 'spock/Ferment: "Beer" #1 (setting)/value.x';
    const gd = plotDiv();
    graphSourceTransformer(src, {
      initial: true,
      ranges: [range(sensor), range(setting)],
    });
    await Plotly.newPlot(gd, Object.values(src.values), layout());

    // A trace that goes away is looked up by its uid
    graphSourceTransformer(src, { initial: true, ranges: [range(sensor)] });
    await Plotly.react(gd, Object.values(src.values), layout());
    expect(traceVisibility(gd)).toEqual([true]);
  });

  it('uses the field as trace uid', () => {
    const src = source();
    graphSourceTransformer(src, {
      initial: true,
      ranges: [range('a'), range('b')],
    });
    expect(src.values.a.uid).toBe(traceUid('a'));
    expect(src.values.b.uid).toBe(traceUid('b'));
    expect(traceUid('a/b [c]')).toBe('612f62205b635d');
    expect(traceUid('a/b [c]')).toMatch(/^[0-9a-f]+$/);
  });

  it('keeps a hidden legend entry with its field', async () => {
    const src = source();
    const gd = plotDiv();
    graphSourceTransformer(src, {
      initial: true,
      ranges: [range('a'), range('b'), range('c')],
    });
    await Plotly.newPlot(gd, Object.values(src.values), layout());
    await guiRestyle(gd, { visible: 'legendonly' }, [1]);
    expect(traceVisibility(gd)).toEqual([true, 'legendonly', true]);

    // A reconnect sends a new initial message, here without field 'a'
    graphSourceTransformer(src, {
      initial: true,
      ranges: [range('b'), range('c')],
    });
    await Plotly.react(gd, Object.values(src.values), layout());
    expect(Object.keys(src.values)).toEqual(['b', 'c']);
    expect(traceVisibility(gd)).toEqual(['legendonly', true]);

    graphSourceTransformer(src, {
      initial: false,
      ranges: [range('a'), range('b'), range('c')],
    });
    await Plotly.react(gd, Object.values(src.values), layout());
    expect(Object.keys(src.values)).toEqual(['b', 'c', 'a']);
    expect(traceVisibility(gd)).toEqual(['legendonly', true, true]);
  });
});
