import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import {
  BlockChange,
  QuickActionsConfig,
} from '@/plugins/spark/features/QuickActions/types';
import { useFeatureStore } from '@/store/features';
import { Widget } from '@/store/widgets';
import { userUnits } from '@/user-settings';
import { bloxLink } from '@/utils/link';
import { typed } from '@/utils/misc';
import {
  bloxQty,
  deltaTempQty,
  inverseTempQty,
  tempQty,
} from '@/utils/quantity';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  Block,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  FilterChoice,
  PidBlock,
  ReferenceKind,
  SetpointSensorPairBlock,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { nanoid } from 'nanoid';
import { DisplayBlock, QuickstartPatch } from '../types';
import {
  changedIoModules,
  pidDefaults,
  unlinkedActuators,
  withoutPrefix,
  withPrefix,
} from '../utils';
import { RimsConfig } from './types';

export function defineChangedBlocks(
  config: RimsConfig,
): QuickstartPatch<Block>[] {
  return [
    ...unlinkedActuators(config.serviceId, [
      config.tubeChannel,
      config.pumpChannel,
    ]),
    ...changedIoModules(config.serviceId, config.changedGpio),
  ];
}

export function defineCreatedBlocks(config: RimsConfig): Block[] {
  const { serviceId, names } = config;

  return [
    // setpoints
    typed<SetpointSensorPairBlock>({
      id: names.kettleSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
      data: {
        sensorId: bloxLink(names.kettleSensor),
        storedSetting: tempQty(67.7),
        enabled: false,
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        filter: FilterChoice.FILTER_15s,
        filterThreshold: deltaTempQty(5),
        resetFilter: false,
        claimedBy: bloxLink(null),
      },
    }),
    typed<SetpointSensorPairBlock>({
      id: names.tubeSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
      data: {
        sensorId: bloxLink(names.tubeSensor),
        storedSetting: tempQty(67.7),
        enabled: false,
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        filter: FilterChoice.FILTER_15s,
        filterThreshold: deltaTempQty(5),
        resetFilter: false,
        claimedBy: bloxLink(null),
      },
    }),
    // Setpoint Driver
    typed<ActuatorOffsetBlock>({
      id: names.tubeDriver,
      type: BlockType.ActuatorOffset,
      serviceId,
      data: {
        targetId: bloxLink(names.tubeSetpoint),
        referenceId: bloxLink(names.kettleSetpoint),
        referenceSettingOrValue: ReferenceKind.REF_SETTING,
        enabled: true,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: {
          constraints: [
            {
              max: 10,
              limiting: false,
            },
          ],
        },
        claimedBy: bloxLink(null),
      },
    }),
    // Digital Actuators
    typed<DigitalActuatorBlock>({
      id: names.tubeAct,
      type: BlockType.DigitalActuator,
      serviceId,
      data: {
        hwDevice: bloxLink(config.tubeChannel.blockId),
        channel: config.tubeChannel.channelId,
        invert: false,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        constrainedBy: { constraints: [] },
        transitionDurationPreset: TransitionDurationPreset.ST_OFF,
        transitionDurationSetting: bloxQty('0s'),
        transitionDurationValue: bloxQty('0s'),
        claimedBy: bloxLink(null),
      },
    }),
    typed<DigitalActuatorBlock>({
      id: names.pumpAct,
      type: BlockType.DigitalActuator,
      serviceId,
      data: {
        hwDevice: bloxLink(config.pumpChannel.blockId),
        channel: config.pumpChannel.channelId,
        invert: false,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        constrainedBy: { constraints: [] },
        transitionDurationPreset: TransitionDurationPreset.ST_OFF,
        transitionDurationSetting: bloxQty('0s'),
        transitionDurationValue: bloxQty('0s'),
        claimedBy: bloxLink(null),
      },
    }),
    // PWM
    typed<ActuatorPwmBlock>({
      id: names.tubePwm,
      type: BlockType.ActuatorPwm,
      serviceId,
      data: {
        enabled: true,
        period: bloxQty('10s'),
        actuatorId: bloxLink(names.tubeAct),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
        claimedBy: bloxLink(null),
      },
    }),
    // PID
    typed<PidBlock>({
      id: names.kettlePid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        kp: inverseTempQty(10),
        ti: bloxQty('5m'),
        td: bloxQty('10s'),
        enabled: true,
        inputId: bloxLink(names.kettleSetpoint),
        outputId: bloxLink(names.tubeDriver),
      },
    }),
    typed<PidBlock>({
      id: names.tubePid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        kp: inverseTempQty(30),
        ti: bloxQty('2m'),
        td: bloxQty('10s'),
        enabled: true,
        inputId: bloxLink(names.tubeSetpoint),
        outputId: bloxLink(names.tubePwm),
      },
    }),
  ];
}

export function defineWidgets(
  config: RimsConfig,
  layouts: BuilderLayout[],
): Widget[] {
  const featureStore = useFeatureStore();
  const { serviceId, dashboardId, names, prefix } = config;
  const userTemp = userUnits.value.temperature;

  const createWidget = (name: string, type: string): Widget => ({
    ...featureStore.widgetSize(type),
    dashboard: dashboardId,
    id: nanoid(),
    title: name,
    feature: type,
    order: 0,
    config: {
      blockId: name,
      serviceId: serviceId,
    },
  });

  const builder: Widget<BuilderConfig> = {
    ...createWidget(withPrefix(prefix, 'Process'), 'Builder'),
    cols: 5,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map((l) => l.id),
    },
  };

  const graph: Widget<GraphConfig> = {
    ...createWidget(withPrefix(prefix, 'Graph'), 'Graph'),
    cols: 6,
    rows: 5,
    pinnedPosition: { x: 6, y: 1 },
    config: {
      version: '1.0',
      layout: {},
      params: { duration: '10m' },
      fields: [
        `${serviceId}/${names.kettleSensor}/value[${userTemp}]`,
        `${serviceId}/${names.tubeSensor}/value[${userTemp}]`,
        `${serviceId}/${names.kettleSetpoint}/setting[${userTemp}]`,
        `${serviceId}/${names.tubeSetpoint}/setting[${userTemp}]`,
        `${serviceId}/${names.tubePwm}/value`,
        `${serviceId}/${names.tubeAct}/state`,
        `${serviceId}/${names.pumpAct}/state`,
      ],
      renames: {
        [`${serviceId}/${names.kettleSensor}/value[${userTemp}]`]:
          'Kettle temperature',
        [`${serviceId}/${names.tubeSensor}/value[${userTemp}]`]:
          'Tube temperature',
        [`${serviceId}/${names.kettleSetpoint}/setting[${userTemp}]`]:
          'Kettle setting',
        [`${serviceId}/${names.tubeSetpoint}/setting[${userTemp}]`]:
          'Tube setting',
        [`${serviceId}/${names.tubePwm}/value`]: 'Tube element PWM value',
        [`${serviceId}/${names.tubeAct}/state`]: 'Tube element active',
        [`${serviceId}/${names.pumpAct}/state`]: 'Pump active',
      },
      axes: {
        [`${serviceId}/${names.tubePwm}/value`]: 'y2',
        [`${serviceId}/${names.tubeAct}/state`]: 'y2',
        [`${serviceId}/${names.pumpAct}/state`]: 'y2',
      },
      colors: {},
      precision: {},
    },
  };

  const QuickActions: Widget<QuickActionsConfig> = {
    ...createWidget(withPrefix(prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      version: '1.0',
      actions: [
        {
          name: 'Enable pump and heater',
          id: nanoid(),
          changes: [
            typed<BlockChange<DigitalActuatorBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.pumpAct,
              data: { desiredState: DigitalState.STATE_ACTIVE },
              confirmed: {},
            }),
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.kettleSetpoint,
              data: { enabled: true },
              confirmed: {},
            }),
          ],
        },
        {
          name: 'Disable pump and heater',
          id: nanoid(),
          changes: [
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.kettleSetpoint,
              data: { enabled: false },
              confirmed: {},
            }),
            typed<BlockChange<DigitalActuatorBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.pumpAct,
              data: { desiredState: DigitalState.STATE_INACTIVE },
              confirmed: {},
            }),
          ],
        },
        {
          name: 'Enable pump',
          id: nanoid(),
          changes: [
            typed<BlockChange<DigitalActuatorBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.pumpAct,
              data: { desiredState: DigitalState.STATE_ACTIVE },
              confirmed: {},
            }),
          ],
        },
        {
          name: 'Disable heater',
          id: nanoid(),
          changes: [
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.kettleSetpoint,
              data: { enabled: false },
              confirmed: {},
            }),
          ],
        },
      ],
    },
  };

  return [builder, graph, QuickActions];
}

export const defineDisplayedBlocks = (config: RimsConfig): DisplayBlock[] => {
  const { kettlePid, tubePid } = config.names;
  return [
    {
      blockId: kettlePid,
      opts: {
        showDialog: false,
        color: 'E1AC00',
        name: withoutPrefix(config.prefix, kettlePid),
      },
    },
    {
      blockId: tubePid,
      opts: {
        showDialog: false,
        color: 'df2b35',
        name: withoutPrefix(config.prefix, tubePid),
      },
    },
  ];
};
