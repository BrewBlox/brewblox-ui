import { LayoutAxis, PlotData } from 'plotly.js';

/** Start and end of an x axis range, in epoch milliseconds */
export type GraphRange = [start: number, end: number];

/**
 * What the x axis of a graph shows.
 * It is kept apart from the graph layout, which is persisted.
 *
 * - `range: null`: the x axis fits all data.
 * - `range` set, not following: the x axis shows `range`.
 * - following: the x axis shows a window as wide as `range`,
 *   ending at the newest point in the graph.
 */
export interface GraphView {
  range: GraphRange | null;
  follow: boolean;
}

export const emptyGraphView = (): GraphView => ({
  range: null,
  follow: false,
});

// 'YYYY-MM-DD HH:MM:SS.ssss', with the time or its smaller parts left out
const PLOTLY_DATE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2})(?::(\d{2})(?::(\d{2})(\.\d+)?)?)?)?$/;

/**
 * Converts a date value from Plotly to epoch milliseconds.
 *
 * On a date axis, Plotly reports ranges as strings in local wall-clock time,
 * without a zone, and with a precision that depends on the span.
 * `new Date(str)` does not reliably parse those as local time.
 * Numbers are epoch milliseconds already.
 */
export function parsePlotlyDate(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const match = PLOTLY_DATE.exec(value.trim());
  if (match == null) {
    return null;
  }
  const [year, month, day, hours, minutes, seconds] = match
    .slice(1, 7)
    .map((v) => Number(v ?? 0));
  const fraction = Number(match[7] ?? 0) * 1000;
  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  return date.getTime() + fraction;
}

export function parsePlotlyRange(value: unknown): GraphRange | null {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }
  const start = parsePlotlyDate(value[0]);
  const end = parsePlotlyDate(value[1]);
  return start != null && end != null ? [start, end] : null;
}

/**
 * The view after a zoom, pan or reset of the x axis in the graph,
 * or null if the event leaves the x axis alone (for example a y axis zoom).
 *
 * @param event the payload of a `plotly_relayout` event.
 * @param shown the x range shown after the event, for events that set one end.
 */
export function relayoutView(
  event: Record<string, unknown>,
  shown: GraphRange | null,
): GraphView | null {
  if (event['xaxis.autorange'] === true) {
    return emptyGraphView();
  }

  let range: [unknown, unknown];
  if (Array.isArray(event['xaxis.range'])) {
    range = [event['xaxis.range'][0], event['xaxis.range'][1]];
  } else if ('xaxis.range[0]' in event || 'xaxis.range[1]' in event) {
    range = [
      'xaxis.range[0]' in event ? event['xaxis.range[0]'] : shown?.[0],
      'xaxis.range[1]' in event ? event['xaxis.range[1]'] : shown?.[1],
    ];
  } else {
    return null;
  }

  const [start, end] = range.map(parsePlotlyDate);
  if (start == null || end == null || start === end) {
    return null;
  }
  return {
    range: [Math.min(start, end), Math.max(start, end)],
    follow: false,
  };
}

/** The x value of the newest point in the graph data */
export function newestX(data: Partial<PlotData>[]): number | null {
  let newest: number | null = null;
  for (const trace of data) {
    const x = trace.x;
    if (x != null && x.length > 0) {
      const value = parsePlotlyDate(x[x.length - 1]);
      if (value != null && (newest == null || value > newest)) {
        newest = value;
      }
    }
  }
  return newest;
}

/** The x value of the oldest point in the graph data */
export function oldestX(data: Partial<PlotData>[]): number | null {
  let oldest: number | null = null;
  for (const trace of data) {
    const x = trace.x;
    if (x != null && x.length > 0) {
      const value = parsePlotlyDate(x[0]);
      if (value != null && (oldest == null || value < oldest)) {
        oldest = value;
      }
    }
  }
  return oldest;
}

/**
 * A window as wide as `range`, ending at the newest point in the data.
 * The newest point, and not the clock of the browser, keeps the data at the
 * right edge: the points carry the time of the history host, which may differ.
 */
export function followRange(
  range: GraphRange,
  data: Partial<PlotData>[],
  now: number = Date.now(),
): GraphRange {
  const end = newestX(data) ?? now;
  return [end - (range[1] - range[0]), end];
}

/** The x range shown for a view, or null if the x axis fits all data */
export function viewRange(
  view: GraphView,
  data: Partial<PlotData>[],
): GraphRange | null {
  if (view.range == null) {
    return null;
  }
  return view.follow ? followRange(view.range, data) : view.range;
}

/**
 * The x axis layout for a shown range.
 *
 * Every render passes the view, also right after a zoom in the graph.
 * uirevision keeps a zoom made in the graph only while the layout input stays
 * what it was before that zoom: once a render passed a range,
 * a render with autorange autoranges.
 *
 * The range is copied, because Plotly writes GUI edits into its layout input.
 */
export function viewAxis(range: GraphRange | null): Partial<LayoutAxis> {
  return range != null
    ? { autorange: false, range: [...range] }
    : { autorange: true };
}
