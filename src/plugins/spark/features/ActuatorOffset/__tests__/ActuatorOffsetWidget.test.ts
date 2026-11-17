import {
  ActuatorOffsetBlock,
  Block,
  BlockIntfType,
  BlockType,
  ReferenceKind,
  SettingMode,
} from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { bloxLink } from '@/utils/link';
import { deltaTempQty, tempQty } from '@/utils/quantity';
import {
  mountBlockWidget,
  slotStub,
} from '../../../../../../test/block-widget';
import ActuatorOffsetWidget from '../ActuatorOffsetWidget.vue';

const driver = (setting: number | null): ActuatorOffsetBlock => ({
  id: 'Driver',
  serviceId: 'sparkey',
  type: BlockType.ActuatorOffset,
  data: {
    enabled: true,
    targetId: bloxLink(
      'HLT Setpoint',
      BlockIntfType.SetpointSensorPairInterface,
    ),
    referenceId: bloxLink(
      'MT Setpoint',
      BlockIntfType.SetpointSensorPairInterface,
    ),
    storedSetting: deltaTempQty(5),
    desiredSetting: deltaTempQty(5),
    setting: deltaTempQty(setting),
    value: deltaTempQty(setting),
    referenceSettingOrValue: ReferenceKind.REF_SETTING,
    constraints: {},
    claimedBy: bloxLink(null),
    settingMode: SettingMode.STORED,
  },
});

const setpoint = (id: string, setting: number | null): Block =>
  ({
    id,
    serviceId: 'sparkey',
    type: BlockType.SetpointSensorPair,
    data: { setting: tempQty(setting), value: tempQty(60) },
  }) as unknown as Block;

const text = (block: ActuatorOffsetBlock, others: Block[]): string =>
  mountBlockWidget(ActuatorOffsetWidget, block, {
    others,
    mode: 'Basic',
    stubs: {
      BlockEnableToggle: true,
      BlockHistoryGraph: true,
      BlockWidgetToolbar: true,
      CardWarning: slotStub('message'),
      PreviewCard: true,
    },
  }).text();

describe('ActuatorOffsetWidget', () => {
  it('names a reference that is gone', () => {
    expect(text(driver(null), [setpoint('HLT Setpoint', 70)])).toContain(
      'Setpoint Driver drives nothing: its reference MT Setpoint is gone.',
    );
  });

  it('names a reference without the setting it follows', () => {
    const others = [
      setpoint('HLT Setpoint', 70),
      setpoint('MT Setpoint', null),
    ];
    expect(text(driver(null), others)).toContain(
      'Setpoint Driver drives nothing: its reference MT Setpoint has no setting.',
    );
  });

  it('warns of nothing while it delivers', () => {
    const others = [setpoint('HLT Setpoint', 70), setpoint('MT Setpoint', 65)];
    expect(text(driver(5), others)).not.toContain('drives nothing');
  });

  it('names the block that holds its target', () => {
    const held = {
      ...setpoint('HLT Setpoint', 70),
      data: { setting: tempQty(70), claimedBy: bloxLink('Other Driver') },
    } as unknown as Block;
    expect(text(driver(null), [held, setpoint('MT Setpoint', 65)])).toContain(
      'Setpoint Driver drives nothing: its target HLT Setpoint is held by Other Driver.',
    );
  });
});
