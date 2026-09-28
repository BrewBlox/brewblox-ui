import { format as formatDate } from 'date-fns/format';
import parseDuration from 'parse-duration';
import { userUISettings } from '@/user-settings';
import { MigrationStatus, QueryParams } from './types';

// The wording and commands follow `brewblox-ctl database migrate-history --status`,
// except for a stop after a change of the averaging interval (see below)
export const MIGRATE_CMD = 'brewblox-ctl database migrate-history';
export const DISCARD_CMD = 'brewblox-ctl database migrate-history --discard';
export const APPLY_CMD = 'brewblox-ctl config apply';

// How often the status is fetched while a migration is not done, and otherwise
export const MIGRATION_POLL_ACTIVE_MS = 10 * 1000;
export const MIGRATION_POLL_IDLE_MS = 60 * 1000;

// History's window when a query sets neither start nor duration
const DEFAULT_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface MigrationLine {
  text: string;
  /** A command to run on the Brewblox host */
  command?: boolean;
}

export interface MigrationSummary {
  /** Short text for the footer */
  label: string;
  /** Quasar text color, or empty for the default */
  color: '' | 'warning' | 'negative';
  /** Sentences and commands for the details menu, in order */
  lines: MigrationLine[];
  /** Whether the migration moves on by itself */
  moving: boolean;
}

const text = (value: string): MigrationLine => ({ text: value });
const command = (value: string): MigrationLine => ({
  text: value,
  command: true,
});

const REFILL_LINE = text(
  'Graphs of the periods before the update fill in as it goes on. ' +
    'Open a graph again to see what was added.',
);

/**
 * Describes a migration that is not done, for a notice.
 * Returns null when there is nothing to show:
 * no migration (never started, declined, or unreadable after a restart) or a finished one.
 *
 * @param status
 * @returns
 */
export function migrationSummary(
  status: Maybe<MigrationStatus>,
): MigrationSummary | null {
  if (status == null || status.phase === 'done') {
    return null;
  }

  if (status.running) {
    let label = 'Migrating history';
    const lines: MigrationLine[] = [];
    if (status.phase === 'seed') {
      lines.push(
        text(
          `Copying the last ${status.dense_days} days of raw history from before the update. ` +
            'Then it averages all history from before the update, newest first.',
        ),
      );
    } else {
      const since = formatDate(
        (status.earliest + status.sparse_interval) * 1000,
        userUISettings.value.dateFormatString,
      );
      const done = status.chunks_done;
      const total = status.chunks_total;
      if (done == null || !total) {
        lines.push(
          text(
            `Averaging history since ${since}: counting the periods already done.`,
          ),
        );
      } else {
        label = `Migrating history ${Math.floor((100 * done) / total)}%`;
        lines.push(
          text(
            `Averaging history since ${since}: ${done} of ${total} periods done.`,
          ),
        );
      }
    }
    lines.push(REFILL_LINE);
    if (status.last_error) {
      lines.push(text(`It tries again after an error: ${status.last_error}`));
    }
    return { label, color: '', lines, moving: true };
  }

  if (status.cancelled) {
    return {
      label: 'History migration paused',
      color: 'warning',
      lines: [
        text(
          'The history migration was stopped. ' +
            'Graphs of the periods before the update stay incomplete. ' +
            'To resume it, run:',
        ),
        command(MIGRATE_CMD),
      ],
      moving: false,
    };
  }

  // History does not resume a migration after the averaging interval changed,
  // and resumes it by itself once the interval is set back.
  // ctl offers only the discard, which averages all history again.
  if (status.last_error?.includes('sparse_interval')) {
    return {
      label: 'History migration stopped',
      color: 'negative',
      lines: [
        text(`The history migration stopped: ${status.last_error}`),
        text(
          'To resume it, set victoria.sparse_interval in brewblox.yml ' +
            `back to ${status.sparse_interval}s, and apply it:`,
        ),
        command(APPLY_CMD),
        text(
          'To migrate at the new interval instead, discard it and start again. ' +
            'That averages all history again, next to the averages at the old interval:',
        ),
        command(DISCARD_CMD),
        command(MIGRATE_CMD),
      ],
      moving: false,
    };
  }

  if (status.last_error) {
    return {
      label: 'History migration stopped',
      color: 'negative',
      lines: [
        text(`The history migration stopped: ${status.last_error}`),
        text('To start again, discard it first:'),
        command(DISCARD_CMD),
        command(MIGRATE_CMD),
      ],
      moving: false,
    };
  }

  // After a restart of the history service, until it has read the migration
  return {
    label: 'Migrating history',
    color: '',
    lines: [
      text('The history service is resuming the migration.'),
      REFILL_LINE,
    ],
    moving: true,
  };
}

/**
 * The start of the window a graph query asks for, in epoch ms.
 * The combinations follow the history service.
 *
 * @param params
 * @param now
 * @returns
 */
export function queryWindowStart(params: QueryParams, now: number): number {
  if (params.start) {
    return new Date(params.start).getTime();
  }
  const end = params.end ? new Date(params.end).getTime() : now;
  const duration = params.duration
    ? (parseDuration(params.duration) ?? DEFAULT_WINDOW_MS)
    : DEFAULT_WINDOW_MS;
  return end - duration;
}

/**
 * A line for a graph without data whose window reaches back before the update,
 * while the migration of the history from before the update is not done.
 *
 * @param status
 * @param params
 * @param now
 * @returns
 */
export function migrationGraphHint(
  status: Maybe<MigrationStatus>,
  params: QueryParams,
  now: number,
): string | null {
  const summary = migrationSummary(status);
  if (summary == null || status == null) {
    return null;
  }
  if (!(queryWindowStart(params, now) < status.legacy_end * 1000)) {
    return null;
  }
  return summary.moving
    ? 'History from before the update is still being migrated. Open the graph again later.'
    : 'History from before the update is not migrated yet.';
}
