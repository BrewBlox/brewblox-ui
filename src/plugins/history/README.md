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
