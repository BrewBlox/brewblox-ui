# History plugin

Graphs, metrics and session logs, backed by the history service.
This document describes what the UI relies on from the service, and why the UI does what it does.
The service itself is described in [brewblox-history's design](https://github.com/BrewBlox/brewblox-history/blob/develop/docs/design.md).

## The history service

History keeps two VictoriaMetrics databases: `victoria-dense` holds every raw sample for 30 days, and `victoria`, the long-term database, holds 60 s averages that history computes from dense.
History picks the database per query: the step is the window's length / 1000, at least 1 s.
A step under 60 s, inside dense's retention, reads raw samples; any other step is rounded up to a multiple of 60 s and reads the averages.
So graphs shorter than about 16.7 h show raw samples, and periods older than 30 days show 60 s averages.

Before configuration version 0.12.0 of brewblox-ctl, history ran one database, the legacy one. The update to 0.12.0 renames it `victoria-legacy`, and ctl offers to migrate it, which history does in the background: first the last 30 days of raw samples into dense, then 60 s averages of the whole legacy history into the long-term database, newest first.
Until the migration reaches a period, graphs of that period are empty: graphs shorter than about 16.7 h of the last 30 days read raw samples and fill in during the first step, and every other graph reads the averages and fills in during the second.

The dev stack in `docker-compose.yml` runs both databases as ctl renders them.

## The ranges stream

Graphs get their data from the `/history/timeseries/stream` WebSocket, one stream per graph (`store/index.ts`).
A `ranges` command starts a stream; a command with the same id replaces it, and `stop` ends it.
Messages are `{id, data: {initial, ranges: [{metric: {__name__}, values: [[seconds, "value"], ...]}]}}`.

- **The initial message** replaces everything the graph holds (`graphSourceTransformer` in `store/transformers.ts`), also when it has no ranges.
  History sends one at the start of every stream, and again when a failed first query is retried: it leaves out the fields without points in the window, and has no ranges at all when none has points.
  When the history host's clock went back more than 60 s, history starts the stream over with an initial message that lists every field, with no points where there are none.
  The UI used to clear only for an initial message with ranges, so after a reconnect it kept the lines it held.
- **Follow-ups** come only for open-ended queries (no arguments, start only, or duration only) and only when there are new points: every second for short graphs, up to every 10 s for long ones.
  They hold only the fields with new points, and every point is sent once, so they are appended as they are.
  Data end at least 5 s before now: newer samples may not be searchable yet.
- **Closed windows** (a start and an end, a duration with a start or an end, or an end only) get one message.
  Graphs of them do not refill: to see what a migration added, open the graph again.
- **Live windows** (a duration only) drop the points that fell out of the window with each message, and a line whose points all left the window is emptied.
  The window ends at the newest point, not at the browser's clock: the points carry the time of the history host, and a Brewblox host without a clock source can be minutes off from the device that shows the graph.
- **The 5000-point reload.** When a line reaches `MAX_GRAPH_POINTS`, `HistoryGraph` recreates the stream, which starts again at the initial step.

The metrics stream (`metrics` commands) sends the latest value of each field every second, from history's memory.

## The migration notice

While a migration of the legacy database is not done, the footer shows it, with a menu that explains the state (`migration.ts`, `LayoutFooter.vue`).
An empty graph whose window reaches back before the update says why (`HistoryGraph.vue`): a session note of a past brew is the typical case.

- **Read-only.** The status comes from `GET /history/timeseries/migrate`.
  Starting, stopping and discarding a migration stay with `brewblox-ctl database migrate-history`: the menu shows the commands where they are needed.
  The wording follows `migrate-history --status`, except for a stop after a change of the averaging interval (below).
- **States.** Seed (no progress count yet), walk with a percentage (or "counting" until the job has counted its chunks), resuming (after a restart of history, until it has read the stored migration), paused (cancelled) and stopped (an error it does not retry).
  History does not resume a migration after the averaging interval (`victoria.sparse_interval`) changed, and resumes it by itself once the interval is set back.
  ctl offers only the discard for this stop, as for the others; the notice offers both, because a discard averages all history again, next to the averages at the old interval.
  A running migration keeps its last error while it retries, so that shows as a detail, not as a failure.
- **Nothing for done.** A finished migration stays in history's datastore, also after the legacy database is removed, so showing it would never end.
  A null status is also shown as nothing: it means no migration, a declined one, or a history service that has not read its state yet.
- **Polling.** Every 10 s while a migration is not done, every 60 s otherwise, and at every stream reconnect (a restart or an update of history).
  A history service from before the migration answers 404 in JSON: the UI stops asking until the stream reconnects.
  When history does not answer, the last status stays; that includes the proxy's plain-text 404 while the history container is down.
  Failures are not logged: the logging store has no limit, and a poll every 10 s would fill it.

## Graph view: zoom and Follow

A history graph keeps updating while it is zoomed or panned.
What the x axis shows, the view, is state of its own and is not part of the graph layout.

### Rendering

`PlotlyGraph` (`src/components/graph/PlotlyGraph.vue`) renders only through `Plotly.react`: new data, layout edits, and size changes from the resize observer and from window resize and orientation change.
The layout it passes carries a constant `uirevision`, so Plotly keeps zoom, pan and legend clicks made in the graph across renders.
Plotly compares `uirevision` with `===`, so it must be a constant primitive: a Date or an object never matches.

`Plotly.relayout` is not used. It was given the merged layout, whose defaults autorange the x axis, so every layout render reset a zoom; it also emits `plotly_relayout` for our own changes, which would feed back into the view.
One 50 ms debounce renders the current data and layout together, so a layout render never shows stale data.
Rendering used to stop while the graph was zoomed; that freeze is gone.

Every render with new data is a full Plotly redraw: `Plotly.react` replots whenever data arrays change.

### The x view

A view (`GraphView` in `src/components/graph/view.ts`) is `{ range: [startMs, endMs] | null, follow: boolean }` in epoch milliseconds.

- A zoom, pan, range entry or reset to a range in the graph sets `range` from the `plotly_relayout` event and turns `follow` off.
- `xaxis.autorange: true` (double click, Autoscale, Reset axes) clears the view.
- Events that only touch a y axis leave the view alone; `uirevision` keeps the y zoom.

Plotly reports date axis values as strings in local wall-clock time without a zone, `'YYYY-MM-DD HH:MM[:SS[.ssss]]'`, with a precision that depends on the span.
`new Date()` parses that format differently per implementation, so `parsePlotlyDate` parses it itself. Numbers pass through.

Every render passes the view, also when it is unset: `{ autorange: true }` without a range, `{ autorange: false, range }` with one. A static plot always gets `{ autorange: true }`.
Once a render has passed an explicit range, a later render with autorange autoranges, and `uirevision` no longer keeps a zoom made in the graph after that. The zoom therefore has to be explicit state, not something left to Plotly.

The plot is created with autorange, and the view (and fitted y axes, see Refine) is applied by a `react` right after: a plot created with an explicit range returns to that range on a double click or Reset, instead of showing all data.

`PlotlyGraph` has an optional two-way `view` model. `PlotlyGraph` changes it only after a zoom, pan or reset in the graph; renders go through `react`, which emits no `plotly_relayout`, so they never change it. The parent can change it too: `HistoryGraph` does for Follow, and clears it in the cases below.
A parent that does not bind it, such as the setpoint profile widget, gets a view that lasts as long as the `PlotlyGraph`; its zoom now survives the updates of its moving "now" line.

The view never goes into the layout that the graph controls emit, because callers save that layout into widget config, which is shared through the datastore.
The layout passed to Plotly is merged into fresh defaults, so what Plotly writes back into its layout input never reaches the `layout` prop.

### HistoryGraph keeps the view

The `PlotlyGraph` is unmounted whenever the data reloads: after 5000 points, when the source is recreated at a lower resolution; after every config edit in the graph widget, including layout-only edits such as a y range; and while there is no data yet.
`HistoryGraph` keeps the view, so the zoom and Follow survive these reloads.
An edit of the query (`config.params`) or of the fields clears it, because a zoom belongs to the data it was made on. `sourceRevision` does not clear it, because the graph widget also bumps it for layout-only edits.

Two more things clear it:

- A graph that turns static. Every graph widget in Basic mode is static while the browser window is narrower than the `md` breakpoint, for example on a tablet turned to portrait. A static plot takes no zoom, double click or reset, so it shows all data: it ignores the view, and its axes get another `uirevision`, which drops a y zoom made before.
- A fixed zoom that ends before the oldest point of a live window (a duration only). The window drops its oldest points as new ones arrive, so a zoom on its oldest part would go blank; a pan past the data would too. The graph shows all data again instead. A zoom on a gap in the data stays.

### Follow

The graph controls show a Follow toggle while the x axis is zoomed, the graph is not static, and the query is open-ended: the history service keeps sending data only for a query with no arguments, a start only, or a duration only.

While following, the graph shows a window as wide as the zoom that ends at the newest point in the graph data, not at the browser's clock.
The points carry the time of the history host, and a Brewblox host without a clock source can be minutes off from the device that shows the graph. The data also end at least 5 s before now, which would leave an empty strip at the right edge.

A zoom or pan in the graph turns Follow off, and the toggle stays so it can be turned back on.
Turning Follow on or off keeps the window that was shown last. While the data reloads, no graph is shown and there are no points to follow, so `HistoryGraph` remembers the range it showed last and uses that.

The toggle sits with the other graph controls: in the page toolbar on the graph page, and in the controls row of dialogs and previews.
Where a graph has no other controls, as in a graph widget in Basic mode, the controls row takes no height and the toggle sits in the empty top margin of the plot. Otherwise the plot would shrink and move down on the first zoom, and grow back on a double click.
The controls row has a high z-index to stay above the plot. The graph root sets `isolation: isolate`, which keeps that z-index inside the graph, so on a dashboard the toggle stays below menus, dialogs and the page header.

### Refine

A zoom only magnifies the points the graph has: a 1 day graph holds points 120 s apart, and its follow-ups come every 10 s. While the x axis is zoomed, the graph controls show a Refine toggle (not on static graphs). It fetches the window shown once, as its own closed-window query (`start` and `end`), under a stream id of its own per graph (`<graphId>:refine:<random>`). History answers it at the window's own step: raw samples for windows under about 16.7 h in the last 30 days (1 s apart under about 16 min), 60 s averages for older periods.

- **Merged, not swapped** (`mergeRefined` in `store/transformers.ts`): per field, the graph shows the refined points and the live points before and after them. Zooming out or panning shows coarse data around the refined stretch instead of an empty graph, and new points keep arriving at the right edge. A refined window can have a coarser step than the live points it covers (60 s averages for zooms of 16.7 h or more, where the newest live points are 10 s apart), so each field keeps whichever has more points in the stretch; equally fine, the refined points.
- **Waits for the live data.** While the live data reloads (the 5000-point reload, a config edit), the graph shows nothing rather than the refined stretch alone, as if it were all data.
- **On while the refined window is shown.** After another zoom the toggle is off again, and refines the new window when turned on: a zoom into a refined window can be refined further. Turning it off returns to the live points.
- **Ends with the zoom.** Showing all data (double click, Autoscale, Reset axes), an edit of the query or the fields, and a graph turning static end it; so does removing the graph. A config edit that reloads the data fetches the refined window again with the new config. A reconnect sends its query again, as it does for every stream.
- **The y axes fit the window shown while the graph holds refined points** (`fitYRanges` in `src/components/graph/view.ts`, the `fitY` prop of `PlotlyGraph`), also after another zoom inside a refined window, until showing all data ends the refinement. Refined points are not averaged, so their peaks reach beyond the range of the coarse points, and a box zoom that was not exactly horizontal also fixed the y range. The fit leaves out hidden traces, as Plotly's autorange does, and keeps a y range set in the graph's range settings. Each refined window has its own y `uirevision`: refining drops a y zoom made before, and a y zoom made after is kept while the fitted range stays the same.

### The legend

The legend shows each field's value at the right edge of the window shown (`legendName` in `store/transformers.ts`): the newest value while the graph shows all data or follows, and the value at the end of a fixed zoom. A graph of a past period must not show current values. There is no value before a field's first point.

`HistoryGraph` gives `PlotlyGraph` copies of the traces, with these names, and `PlotlyGraph` gives Plotly new copies again for every render. Plotly writes edits such as a legend click into the trace objects it gets, and keeps them across renders only while the traces it gets do not carry them themselves. The store's traces would carry them along into every follow-up, and an initial message, which history sends at every reconnect, would drop them; the same copies passed again, by a render without new data such as after a resize, would carry them too. With new copies every time, the edits stay with the plot, and out of the source that other graphs may share.

With a constant `uirevision`, Plotly matches the legend visibility a user set to traces by `uid`, and falls back to the trace index. History traces set `uid` to their field, written as hex (`traceUid`): Plotly builds CSS selectors and element ids from uids, and a field name such as `sparkey/Ferment Fridge Sensor/value[degC]` is valid in neither. Without a uid, a message that leaves out or reorders fields would hide the wrong trace.

Graphs that share a source, such as the builder graph display and its maximized dialog, each keep their own view and their own legend. The builder part is static, so it has no zoom and no Follow.

### Known limits

- Outside a refined window, the y axes autorange over all data, not over the visible x window, so an x zoom or Follow on a long graph can show a flat line. A diagonal box zoom sets the y range too.
- The 5000-point reload resets the resolution of the newest data to the query's initial step. The x zoom and Follow survive it; a y zoom and hidden legend entries do not.
- A hidden field that an initial message leaves out (it has no points in the window) is shown again when it comes back.
- Follow moves only when new data arrive: every 1 s for short graphs, up to every 10 s for long ones.
- If a daylight saving change falls inside a followed window, its width can be off by up to an hour.
- A 10 min graph now redraws every second (every 10 s before the dense setup). Nobody has measured that on a dashboard with many short graphs on a weak tablet.
