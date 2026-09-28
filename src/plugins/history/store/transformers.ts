import forEach from 'lodash/forEach';
import last from 'lodash/last';
import sortedLastIndex from 'lodash/sortedLastIndex';
import parseDuration from 'parse-duration';
import {
  DEFAULT_GRAPH_DECIMALS,
  MAX_GRAPH_POINTS,
  Y2_COLOR,
} from '@/plugins/history/const';
import { defaultLabel } from '@/plugins/history/nodes';
import {
  GraphSource,
  MetricsSource,
  TimeSeriesMetricsResult,
  TimeSeriesRangesResult,
} from '@/plugins/history/types';
import { fixedNumber } from '@/utils/quantity';

function boundedConcat(left: number[] = [], right: number[] = []): number[] {
  const sliced = Math.max(left.length + right.length - MAX_GRAPH_POINTS, 0);
  if (sliced > left.length) {
    return right.slice(sliced - left.length);
  }
  if (sliced > 0) {
    const result = left.slice(sliced);
    result.push(...right);
    return result;
  }
  return [...left, ...right];
}

/**
 * Returns a HTML span element with the field name postfixed with the current value.
 *
 * @param source
 * @param key
 * @param value
 * @returns
 */
function fieldLabel(
  source: GraphSource,
  key: string,
  value: number | undefined,
): string {
  const label = source.renames[key] || defaultLabel(key);
  const precision = source.precision[key] ?? DEFAULT_GRAPH_DECIMALS;
  const prop = source.axes[key] === 'y2' ? `style="color: ${Y2_COLOR}"` : '';
  return `<span ${prop}>${label}<br>${fixedNumber(value, precision)}</span>`;
}

/**
 * The trace uid of a field: its name as hex.
 * Plotly builds CSS selectors and element ids from uids,
 * and a field name can hold any character.
 *
 * @param key
 * @returns
 */
export function traceUid(key: string): string {
  return Array.from(new TextEncoder().encode(key), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

/**
 * The legend name of a field: its label, and its value at the right edge of the window
 * shown (`end`, epoch ms), or its newest value when the graph shows all data.
 *
 * @param source
 * @param key
 * @param end
 * @returns
 */
export function legendName(
  source: GraphSource,
  key: string,
  end: number | null,
): string {
  const { x, y } = source.values[key];
  const idx = end == null ? y.length - 1 : sortedLastIndex(x, end) - 1;
  return fieldLabel(source, key, idx >= 0 ? y[idx] : undefined);
}

/**
 * Applies a message of a `ranges` stream to the graph source.
 *
 * An initial message replaces everything the source holds, also when it has no ranges.
 * History sends one at the start of every stream: it leaves out the fields without points
 * in the window, and has no ranges when none has points.
 * It sends another after its clock went back, which lists every field.
 * Follow-up messages hold only the new points of the fields that have them, and are appended.
 *
 * @param source
 * @param result
 */
export function graphSourceTransformer(
  source: GraphSource,
  result: TimeSeriesRangesResult,
): void {
  if (result.initial) {
    source.values = {};
  }

  result.ranges.forEach((range) => {
    const key = range.metric.__name__;
    const existing = source.values[key];
    const min = source.min?.[key];
    const max = source.max?.[key];

    const x: number[] = boundedConcat(
      existing?.x,
      range.values.map((v) => v[0] * 1000),
    );
    const y: number[] = boundedConcat(
      existing?.y,
      range.values.map((v) => {
        const value = Number(v[1]);
        if (min != null && value < min) {
          return NaN;
        }
        if (max != null && value > max) {
          return NaN;
        }
        return Number(v[1]);
      }),
    );
    source.values[key] = {
      ...existing, // Plotly can set values
      uid: traceUid(key),
      x,
      y,
      type: 'scattergl',
      mode: 'lines',
      name: fieldLabel(source, key, last(y)),
      yaxis: source.axes[key] ?? 'y',
      line: { color: source.colors[key] },
    };
  });

  if (source.params.duration && !source.params.start && !source.params.end) {
    // The window ends at the newest point, not at the browser's now:
    // the points carry the time of the history host, whose clock can differ.
    // Timestamp in Ms that should be discarded
    const newest = Math.max(
      ...Object.values(source.values).map((val) => last(val.x) ?? -Infinity),
    );
    const boundary = newest - (parseDuration(source.params.duration) ?? 0);
    forEach(source.values, (val, key) => {
      const boundaryIdx = val.x.findIndex((x: number) => x > boundary);
      if (boundaryIdx > 0) {
        val.x = val.x.slice(boundaryIdx);
        val.y = val.y.slice(boundaryIdx);
      }
      // A field that stopped getting points (a deleted block, a removed service)
      // would otherwise keep its line, and stretch the x axis back to it
      if (boundaryIdx === -1 && val.x.length > 0) {
        val.x = [];
        val.y = [];
        val.name = fieldLabel(source, key, undefined);
      }
    });
  }

  source.truncated = Object.values(source.values).some(
    (vals) => vals.x.length === MAX_GRAPH_POINTS,
  );
}

export function metricsSourceTransformer(
  source: MetricsSource,
  result: TimeSeriesMetricsResult,
): void {
  source.updated = new Date();
  source.values = result.metrics.map((res) => ({
    field: res.metric,
    time: new Date(res.timestamp),
    value: res.value,
  }));
}
