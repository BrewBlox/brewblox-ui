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
import { bloxQty, deltaTempQty, tempQty } from '@/utils/quantity';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  AnalogConstraint,
  BalancerBlock,
  Block,
  BlockType,
  DigitalActuatorBlock,
  DigitalConstraint,
  DigitalState,
  FilterChoice,
  MutexBlock,
  PidBlock,
  ReferenceKind,
  SetpointSensorPairBlock,
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
import { HermsConfig } from './types';

export function defineChangedBlocks(
  config: HermsConfig,
): QuickstartPatch<Block>[] {
  return [
    ...unlinkedActuators(config.serviceId, [
      config.hltChannel,
      config.bkChannel,
    ]),
    ...changedIoModules(config.serviceId, config.changedGpio),
  ];
}

export function defineCreatedBlocks(config: HermsConfig): Block[] {
  const { serviceId, names, hermsOpts } = config;

  const pwmConstraints: AnalogConstraint[] = [];
  const actuatorConstraints: DigitalConstraint[] = [];

  if (config.mutex) {
    pwmConstraints.push({
      balanced: {
        balancerId: bloxLink(names.balancer),
        granted: 0,
        id: 0,
      },
      limiting: false,
    });
    actuatorConstraints.push({
      mutexed: {
        mutexId: bloxLink(names.mutex),
        extraHoldTime: bloxQty('0s'),
        hasCustomHoldTime: true,
        hasLock: false,
      },
      remaining: bloxQty('0s'),
    });
  }

  const balancerBlocks: Block[] = [
    typed<BalancerBlock>({
      id: names.balancer,
      type: BlockType.Balancer,
      serviceId,
      data: { clients: [] },
    }),
    typed<MutexBlock>({
      id: names.mutex,
      type: BlockType.Mutex,
      serviceId,
      data: {
        differentActuatorWait: bloxQty('0s'),
        waitRemaining: bloxQty('0s'),
      },
    }),
  ];

  const baseBlocks: Block[] = [
    // Setpoints
    typed<SetpointSensorPairBlock>({
      id: names.hltSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
      data: {
        sensorId: bloxLink(names.hltSensor),
        storedSetting: tempQty(70),
        settingEnabled: false,
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        filterThreshold: deltaTempQty(5),
        filter: FilterChoice.FILTER_15s,
        resetFilter: false,
      },
    }),
    typed<SetpointSensorPairBlock>({
      id: names.mtSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
      data: {
        sensorId: bloxLink(names.mtSensor),
        storedSetting: tempQty(67),
        settingEnabled: false,
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        filterThreshold: deltaTempQty(5),
        filter: FilterChoice.FILTER_15s,
        resetFilter: false,
      },
    }),
    typed<SetpointSensorPairBlock>({
      id: names.bkSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
      data: {
        sensorId: bloxLink(names.bkSensor),
        storedSetting: tempQty(70),
        settingEnabled: false,
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        filterThreshold: deltaTempQty(5),
        filter: FilterChoice.FILTER_15s,
        resetFilter: false,
      },
    }),
    // Setpoint Driver
    typed<ActuatorOffsetBlock>({
      id: names.hltDriver,
      type: BlockType.ActuatorOffset,
      serviceId,
      data: {
        targetId: bloxLink(names.hltSetpoint),
        drivenTargetId: bloxLink(names.hltSetpoint),
        referenceId: bloxLink(names.mtSetpoint),
        referenceSettingOrValue: ReferenceKind.REF_SETTING,
        enabled: false,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: {
          constraints: [
            {
              max: hermsOpts.driverMax.value!,
              limiting: false,
            },
          ],
        },
      },
    }),
    // Digital Actuators
    typed<DigitalActuatorBlock>({
      id: names.hltAct,
      type: BlockType.DigitalActuator,
      serviceId,
      data: {
        hwDevice: bloxLink(config.hltChannel.blockId),
        channel: config.hltChannel.channelId,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        invert: false,
        constrainedBy: {
          constraints: actuatorConstraints,
        },
      },
    }),
    typed<DigitalActuatorBlock>({
      id: names.bkAct,
      type: BlockType.DigitalActuator,
      serviceId,
      data: {
        hwDevice: bloxLink(config.bkChannel.blockId),
        channel: config.bkChannel.channelId,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        invert: false,
        constrainedBy: {
          constraints: actuatorConstraints,
        },
      },
    }),
    // PWM
    typed<ActuatorPwmBlock>({
      id: names.hltPwm,
      type: BlockType.ActuatorPwm,
      serviceId,
      data: {
        enabled: true,
        period: bloxQty('2s'),
        actuatorId: bloxLink(names.hltAct),
        drivenActuatorId: bloxLink(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: {
          constraints: pwmConstraints,
        },
      },
    }),
    typed<ActuatorPwmBlock>({
      id: names.bkPwm,
      type: BlockType.ActuatorPwm,
      serviceId,
      data: {
        enabled: true,
        period: bloxQty('2s'),
        actuatorId: bloxLink(names.bkAct),
        drivenActuatorId: bloxLink(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: {
          constraints: pwmConstraints,
        },
      },
    }),
    // PID
    typed<PidBlock>({
      id: names.hltPid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        enabled: true,
        inputId: bloxLink(names.hltSetpoint),
        outputId: bloxLink(names.hltPwm),
        kp: hermsOpts.hltKp,
        ti: bloxQty('10m'),
        td: bloxQty('10s'),
        boilMinOutput: 25,
      },
    }),
    typed<PidBlock>({
      id: names.mtPid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        enabled: true,
        inputId: bloxLink(names.mtSetpoint),
        outputId: bloxLink(names.hltDriver),
        kp: hermsOpts.mtKp,
        ti: bloxQty('5m'),
        td: bloxQty('10m'),
      },
    }),
    typed<PidBlock>({
      id: names.bkPid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        enabled: true,
        inputId: bloxLink(names.bkSetpoint),
        outputId: bloxLink(names.bkPwm),
        kp: hermsOpts.bkKp,
        ti: bloxQty('10m'),
        td: bloxQty('10s'),
        boilMinOutput: 25,
      },
    }),
  ];

  return config.mutex ? [...balancerBlocks, ...baseBlocks] : baseBlocks;
}

export function defineWidgets(
  config: HermsConfig,
  layouts: BuilderLayout[],
): Widget[] {
  const featureStore = useFeatureStore();
  const { serviceId, names, dashboardId, prefix } = config;
  const userTemp = userUnits.value.temperature;
  const genericSettings = {
    dashboard: dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const createWidget = (name: string, type: string): Widget => ({
    ...genericSettings,
    ...featureStore.widgetSize(type),
    id: nanoid(),
    title: name,
    feature: type,
    order: 0,
    config: {
      blockId: name,
      serviceId: serviceId,
    },
  });

  const createBuilder = (): Widget<BuilderConfig> => ({
    ...createWidget(withPrefix(prefix, 'Process'), 'Builder'),
    cols: 11,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map((l) => l.id),
    },
  });

  const createGraph = (): Widget<GraphConfig> => ({
    ...createWidget(withPrefix(prefix, 'Graph'), 'Graph'),
    cols: 7,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      version: '1.0',
      layout: {},
      params: { duration: '10m' },
      fields: [
        `${serviceId}/${names.hltSensor}/value[${userTemp}]`,
        `${serviceId}/${names.mtSensor}/value[${userTemp}]`,
        `${serviceId}/${names.bkSensor}/value[${userTemp}]`,
        `${serviceId}/${names.hltSetpoint}/setting[${userTemp}]`,
        `${serviceId}/${names.mtSetpoint}/setting[${userTemp}]`,
        `${serviceId}/${names.bkSetpoint}/setting[${userTemp}]`,
        `${serviceId}/${names.hltPwm}/value`,
        `${serviceId}/${names.bkPwm}/value`,
      ],
      renames: {
        [`${serviceId}/${names.hltSensor}/value[${userTemp}]`]:
          'HLT temperature',
        [`${serviceId}/${names.mtSensor}/value[${userTemp}]`]: 'MT temperature',
        [`${serviceId}/${names.bkSensor}/value[${userTemp}]`]: 'BK temperature',
        [`${serviceId}/${names.hltSetpoint}/setting[${userTemp}]`]:
          'HLT setting',
        [`${serviceId}/${names.mtSetpoint}/setting[${userTemp}]`]: 'MT setting',
        [`${serviceId}/${names.bkSetpoint}/setting[${userTemp}]`]: 'BK setting',
        [`${serviceId}/${names.hltPwm}/value`]: 'HLT PWM value',
        [`${serviceId}/${names.bkPwm}/value`]: 'BK PWM value',
      },
      axes: {
        [`${serviceId}/${names.hltPwm}/value`]: 'y2',
        [`${serviceId}/${names.bkPwm}/value`]: 'y2',
      },
      colors: {},
      precision: {},
    },
  });

  const createQuickActions = (): Widget<QuickActionsConfig> => ({
    ...createWidget(withPrefix(prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 8, y: 6 },
    config: {
      version: '1.0',
      actions: [
        {
          name: 'Disable all setpoints',
          id: nanoid(),
          changes: [
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.hltSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            }),
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.mtSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            }),
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.bkSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            }),
          ],
        },
        {
          name: 'Constant HLT Temp',
          id: nanoid(),
          changes: [
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.mtSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            }),
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.hltSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: tempQty(70),
              },
              confirmed: {
                storedSetting: true,
              },
            }),
          ],
        },
        {
          name: 'Constant MT Temp',
          id: nanoid(),
          changes: [
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.mtSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: tempQty(66.7),
              },
              confirmed: {
                storedSetting: true,
              },
            }),
            typed<BlockChange<ActuatorOffsetBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.hltDriver,
              data: {
                enabled: true,
              },
              confirmed: {},
            }),
          ],
        },
        {
          name: 'Constant BK Temp',
          id: nanoid(),
          changes: [
            typed<BlockChange<SetpointSensorPairBlock>>({
              id: nanoid(),
              serviceId,
              blockId: names.bkSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: tempQty(100),
              },
              confirmed: {
                storedSetting: true,
              },
            }),
          ],
        },
      ],
    },
  });

  return [createBuilder(), createGraph(), createQuickActions()];
}

export const defineDisplayedBlocks = (config: HermsConfig): DisplayBlock[] => {
  const { hltPid, mtPid, bkPid } = config.names;
  return [
    {
      blockId: hltPid,
      opts: {
        showDialog: false,
        color: 'b50000',
        name: withoutPrefix(config.prefix, hltPid),
      },
    },
    {
      blockId: mtPid,
      opts: {
        showDialog: false,
        color: '9c4b00',
        name: withoutPrefix(config.prefix, mtPid),
      },
    },
    {
      blockId: bkPid,
      opts: {
        showDialog: false,
        color: 'c48600',
        name: withoutPrefix(config.prefix, bkPid),
      },
    },
  ];
};
