import { Block, Link } from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { calculateClaims } from '@/plugins/spark/utils/claims';
import { bloxLink } from '@/utils/link';

const link = (id: string | null): Link => bloxLink(id);

const block = (id: string, data: Record<string, unknown>): Block =>
  ({ id, serviceId: 'sparkey', type: 'Test', data }) as unknown as Block;

describe('calculateClaims', () => {
  it('follows claims up the chain of claimers', () => {
    const blocks = [
      block('Pid', {}),
      block('Pwm', { claimedBy: link('Pid') }),
      block('Actuator', { claimedBy: link('Pwm') }),
      block('Pins', {
        channels: [{ claimedBy: link('Actuator') }, { claimedBy: link(null) }],
      }),
    ];
    expect(calculateClaims(blocks)).toEqual([
      { source: 'Pid', target: 'Pwm', intermediate: [] },
      { source: 'Pid', target: 'Actuator', intermediate: ['Pwm'] },
      { source: 'Pid', target: 'Pins', intermediate: ['Actuator', 'Pwm'] },
    ]);
  });

  it('stops at a circular claim', () => {
    const blocks = [
      block('A', { claimedBy: link('B') }),
      block('B', { claimedBy: link('A') }),
    ];
    expect(calculateClaims(blocks)).toEqual([
      { source: 'A', target: 'A', intermediate: ['B'] },
      { source: 'B', target: 'B', intermediate: ['A'] },
    ]);
  });
});
