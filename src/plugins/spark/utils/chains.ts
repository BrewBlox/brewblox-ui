import { Block, IoChannel } from 'brewblox-proto/ts';
import { isLink } from '@/utils/identity';

/**
 * A step in the control chain through a block:
 * a block, or the IO channel that an actuator switches.
 */
export interface ChainStep {
  /** The block, or for a channel its IO module */
  id: string;
  /** Set when the step is a channel of the `id` block */
  channel?: number;
  /** Other blocks in the same place, such as the second PID reading a setpoint */
  alternatives: string[];
  /**
   * Whether the link from the previous step is in effect.
   * A driver acts on its target while it claims it: a disabled PID does not.
   * A PID always reads its input.
   */
  active: boolean;
}

/** Links through which a block drives the block they point to */
const DRIVE_FIELDS = ['outputId', 'actuatorId', 'targetId'];

function linkId(block: Block, field: string): string | null {
  const value = block.data[field];
  return isLink(value) ? (value.id ?? null) : null;
}

function drivenId(block: Block): string | null {
  for (const field of DRIVE_FIELDS) {
    const id = linkId(block, field);
    if (id != null) {
      return id;
    }
  }
  return null;
}

/**
 * The control chain through a block.
 * Below the block, the chain can split, where PIDs read the same setpoint:
 * `steps` then ends at that setpoint, and each branch continues from it.
 */
export interface BlockChain {
  steps: ChainStep[];
  branches: ChainStep[][];
}

/**
 * Finds the control chain through a block:
 * from the block at the top that drives it, down to the IO channel it switches.
 *
 * Going up, a PID follows its input setpoint;
 * other blocks follow the block claiming them, or else a block linking to them
 * as its output, actuator or target (a disabled PID claims nothing).
 * Going down, a block follows that same link,
 * a setpoint the PIDs reading it, and an actuator its IO channel.
 * The first split below the block becomes branches.
 * Anywhere else, the chain takes the first way and lists the others as alternatives.
 */
export function blockChain(blocks: Block[], id: string): BlockChain {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const start = byId.get(id);
  if (start == null) {
    return { steps: [], branches: [] };
  }
  const visited = new Set<string>([id]);

  const unvisited = (ids: (string | null)[]): string[] =>
    ids.filter(
      (v, idx): v is string =>
        v != null && !visited.has(v) && byId.has(v) && ids.indexOf(v) === idx,
    );

  const upward = (block: Block): string[] => {
    if ('inputId' in block.data) {
      return unvisited([linkId(block, 'inputId')]);
    }
    const linking = blocks
      .filter((b) => drivenId(b) === block.id)
      .map((b) => b.id)
      .sort();
    return unvisited([linkId(block, 'claimedBy'), ...linking]);
  };

  const downward = (block: Block): string[] => {
    const driven = drivenId(block);
    if (driven != null) {
      return unvisited([driven]);
    }
    // PIDs reading a setpoint, enabled ones first
    return unvisited(
      blocks
        .filter((b) => linkId(b, 'inputId') === block.id)
        .sort(
          (a, b) =>
            Number(Boolean(b.data.enabled)) - Number(Boolean(a.data.enabled)) ||
            a.id.localeCompare(b.id),
        )
        .map((b) => b.id),
    );
  };

  const channelSteps = (block: Block): ChainStep[] => {
    const hwDevice = linkId(block, 'hwDevice');
    const channel = Number(block.data.channel);
    return hwDevice != null && channel > 0 && byId.has(hwDevice)
      ? [{ id: hwDevice, channel, alternatives: [], active: false }]
      : [];
  };

  // Follows the chain down, taking the first way where it splits
  const followDown = (from: Block): ChainStep[] => {
    const steps: ChainStep[] = [];
    let last = from;
    for (;;) {
      const [next, ...alternatives] = downward(last);
      if (next == null) {
        return [...steps, ...channelSteps(last)];
      }
      visited.add(next);
      steps.push({ id: next, alternatives, active: false });
      last = byId.get(next)!;
    }
  };

  const up: ChainStep[] = [];
  for (let block = start; ;) {
    const [next, ...alternatives] = upward(block);
    if (next == null) {
      break;
    }
    visited.add(next);
    up.unshift({ id: next, alternatives, active: false });
    block = byId.get(next)!;
  }

  // Down from the block, until the chain ends or splits
  const down: ChainStep[] = [];
  let branches: ChainStep[][] = [];
  for (let last = start; ;) {
    const next = downward(last);
    if (next.length > 1) {
      next.forEach((v) => visited.add(v));
      branches = next.map((v) => [
        { id: v, alternatives: [], active: false },
        ...followDown(byId.get(v)!),
      ]);
      break;
    }
    if (next.length === 0) {
      down.push(...channelSteps(last));
      break;
    }
    visited.add(next[0]);
    down.push({ id: next[0], alternatives: [], active: false });
    last = byId.get(next[0])!;
  }

  // Whether the link from one step to the next is in effect
  const linkActive = (from: ChainStep, step: ChainStep): boolean => {
    const to = byId.get(step.id);
    if (to == null) {
      return true;
    }
    if (step.channel != null) {
      const channels: IoChannel[] = to.data.channels ?? [];
      return (
        channels.find((c) => c.id === step.channel)?.claimedBy?.id === from.id
      );
    }
    if (linkId(to, 'inputId') === from.id) {
      return true;
    }
    return linkId(to, 'claimedBy') === from.id;
  };
  const setActive = (steps: ChainStep[], from?: ChainStep): void =>
    steps.forEach((step, idx) => {
      const prev = idx > 0 ? steps[idx - 1] : from;
      step.active = prev == null || linkActive(prev, step);
    });

  const steps = [...up, { id, alternatives: [], active: true }, ...down];
  setActive(steps);
  branches.forEach((branch) => setActive(branch, steps[steps.length - 1]));
  return { steps, branches };
}

/** Whether a block is part of a control chain */
export function isChained(chain: BlockChain): boolean {
  return chain.steps.length > 1 || chain.branches.length > 0;
}

/** Whether a block (or a channel of it) is a step in a chain */
export function chainIncludes(chain: BlockChain, id: string): boolean {
  return [...chain.steps, ...chain.branches.flat()].some((s) => s.id === id);
}
