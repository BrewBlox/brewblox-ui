import { Block, BlockType } from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { analogChannelReaders } from '@/plugins/spark/utils/info';
import { bloxLink } from '@/utils/link';

const block = (
  id: string,
  data: Record<string, unknown>,
  type: string = BlockType.TempSensorAnalog,
): Block => ({ id, serviceId: 'sparkey', type, data }) as unknown as Block;

const reader = (id: string, device: string | null, channel: number): Block =>
  block(id, { analogDevice: bloxLink(device), analogChannel: channel });

const ids = (blocks: Block[]): string[] => blocks.map((b) => b.id);

describe('analogChannelReaders', () => {
  it('lists every block that links the channel, of any type', () => {
    const blocks = [
      reader('Sensor A', 'GPIO', 1),
      block(
        'Pressure',
        { analogDevice: bloxLink('GPIO'), analogChannel: 1 },
        'SomeFutureSensor',
      ),
    ];

    expect(ids(analogChannelReaders(blocks, 'GPIO', 1))).toEqual([
      'Sensor A',
      'Pressure',
    ]);
  });

  it('leaves out readers of another channel or another module', () => {
    const blocks = [
      reader('Other channel', 'GPIO', 2),
      reader('Other module', 'GPIO 2', 1),
      reader('Unlinked', null, 0),
    ];

    expect(analogChannelReaders(blocks, 'GPIO', 1)).toEqual([]);
  });

  it('leaves out blocks without an analogDevice link', () => {
    const blocks = [
      block('Digital', { hwDevice: bloxLink('GPIO'), channel: 1 }),
      block('Not a link', { analogDevice: 'GPIO', analogChannel: 1 }),
    ];

    expect(analogChannelReaders(blocks, 'GPIO', 1)).toEqual([]);
  });
});
