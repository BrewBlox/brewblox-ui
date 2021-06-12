import { nanoid } from 'nanoid';

import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import { BlockChange, QuickActionsConfig } from '@/plugins/spark/features/QuickActions/types';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  BalancerBlock,
  Block,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  FilterChoice,
  MutexBlock,
  PidBlock,
  ReferenceKind,
  SetpointSensorPairBlock,
} from '@/plugins/spark/types';
import { AnalogConstraint, DigitalConstraint } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';
import { systemStore } from '@/store/system';
import { Widget } from '@/store/widgets';
import { bloxLink } from '@/utils/link';
import { bloxQty, deltaTempQty, tempQty } from '@/utils/quantity';

import { DisplayBlock } from '../types';
import { pidDefaults, unlinkedActuators, withoutPrefix, withPrefix } from '../utils';
import { HermsConfig, HermsOpts } from './types';

export function defineChangedBlocks(config: HermsConfig): Block[] {
  return unlinkedActuators(config.serviceId, [config.hltPin, config.bkPin]);
}

export function defineCreatedBlocks(config: HermsConfig, opts: HermsOpts): Block[] {
  const groups = [0];
  const { serviceId, names } = config;

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
    actuatorConstraints.push(
      {
        mutexed: {
          mutexId: bloxLink(names.mutex),
          extraHoldTime: bloxQty('0s'),
          hasCustomHoldTime: true,
          hasLock: false,
        },
        remaining: bloxQty('0s'),
      },
    );
  }

  const balancerBlocks: [
    BalancerBlock,
    MutexBlock,
  ] = [
      {
        id: names.balancer,
        type: BlockType.Balancer,
        serviceId,
        groups,
        data: { clients: [] },
      },
      {
        id: names.mutex,
        type: BlockType.Mutex,
        serviceId,
        groups,
        data: {
          differentActuatorWait: bloxQty('0s'),
          waitRemaining: bloxQty('0s'),
        },
      },
    ];

  const baseBlocks: [
    SetpointSensorPairBlock,
    SetpointSensorPairBlock,
    SetpointSensorPairBlock,
    ActuatorOffsetBlock,
    DigitalActuatorBlock,
    DigitalActuatorBlock,
    ActuatorPwmBlock,
    ActuatorPwmBlock,
    PidBlock,
    PidBlock,
    PidBlock,
  ] = [
      // Setpoints
      {
        id: names.hltSetpoint,
        type: BlockType.SetpointSensorPair,
        serviceId,
        groups,
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
      },
      {
        id: names.mtSetpoint,
        type: BlockType.SetpointSensorPair,
        serviceId,
        groups,
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
      },
      {
        id: names.bkSetpoint,
        type: BlockType.SetpointSensorPair,
        serviceId,
        groups,
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
      },
      // Setpoint Driver
      {
        id: names.hltDriver,
        type: BlockType.ActuatorOffset,
        serviceId,
        groups,
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
                max: opts.driverMax.value!,
                limiting: false,
              },
            ],
          },
        },
      },
      // Digital Actuators
      {
        id: names.hltAct,
        type: BlockType.DigitalActuator,
        serviceId,
        groups,
        data: {
          hwDevice: bloxLink(config.hltPin.arrayId),
          channel: config.hltPin.pinId,
          desiredState: DigitalState.STATE_INACTIVE,
          state: DigitalState.STATE_INACTIVE,
          invert: false,
          constrainedBy: {
            constraints: actuatorConstraints,
          },
        },
      },
      {
        id: names.bkAct,
        type: BlockType.DigitalActuator,
        serviceId,
        groups,
        data: {
          hwDevice: bloxLink(config.bkPin.arrayId),
          channel: config.bkPin.pinId,
          desiredState: DigitalState.STATE_INACTIVE,
          state: DigitalState.STATE_INACTIVE,
          invert: false,
          constrainedBy: {
            constraints: actuatorConstraints,
          },
        },
      },
      // PWM
      {
        id: names.hltPwm,
        type: BlockType.ActuatorPwm,
        serviceId,
        groups,
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
      },
      {
        id: names.bkPwm,
        type: BlockType.ActuatorPwm,
        serviceId,
        groups,
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
      },
      // PID
      {
        id: names.hltPid,
        type: BlockType.Pid,
        serviceId,
        groups,
        data: {
          ...pidDefaults(),
          enabled: true,
          inputId: bloxLink(names.hltSetpoint),
          outputId: bloxLink(names.hltPwm),
          kp: opts.hltKp,
          ti: bloxQty('10m'),
          td: bloxQty('10s'),
          boilMinOutput: 25,
        },
      },
      {
        id: names.mtPid,
        type: BlockType.Pid,
        serviceId,
        groups,
        data: {
          ...pidDefaults(),
          enabled: true,
          inputId: bloxLink(names.mtSetpoint),
          outputId: bloxLink(names.hltDriver),
          kp: opts.mtKp,
          ti: bloxQty('5m'),
          td: bloxQty('10m'),
        },
      },
      {
        id: names.bkPid,
        type: BlockType.Pid,
        serviceId,
        groups,
        data: {
          ...pidDefaults(),
          enabled: true,
          inputId: bloxLink(names.bkSetpoint),
          outputId: bloxLink(names.bkPwm),
          kp: opts.bkKp,
          ti: bloxQty('10m'),
          td: bloxQty('10s'),
          boilMinOutput: 25,
        },
      },
    ];

  return config.mutex
    ? [...balancerBlocks, ...baseBlocks]
    : baseBlocks;
}


export function defineWidgets(config: HermsConfig, layouts: BuilderLayout[]): Widget[] {
  const { serviceId, names, dashboardId, prefix } = config;
  const userTemp = systemStore.units.temperature;
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
      layoutIds: layouts.map(l => l.id),
    },
  });

  const createGraph = (): Widget<GraphConfig> => ({
    ...createWidget(withPrefix(prefix, 'Graph'), 'Graph'),
    cols: 7,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: serviceId,
          fields: [
            `${names.hltSensor}/value[${userTemp}]`,
            `${names.mtSensor}/value[${userTemp}]`,
            `${names.bkSensor}/value[${userTemp}]`,
            `${names.hltSetpoint}/setting[${userTemp}]`,
            `${names.mtSetpoint}/setting[${userTemp}]`,
            `${names.bkSetpoint}/setting[${userTemp}]`,
            `${names.hltPwm}/value`,
            `${names.bkPwm}/value`,
          ],
        },
      ],
      renames: {
        [`${serviceId}/${names.hltSensor}/value[${userTemp}]`]: 'HLT temperature',
        [`${serviceId}/${names.mtSensor}/value[${userTemp}]`]: 'MT temperature',
        [`${serviceId}/${names.bkSensor}/value[${userTemp}]`]: 'BK temperature',
        [`${serviceId}/${names.hltSetpoint}/setting[${userTemp}]`]: 'HLT setting',
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
      serviceId,
      changeIdMigrated: true,
      serviceIdMigrated: true,
      actions: [
        {
          name: 'Disable all setpoints',
          id: nanoid(),
          changes: [
            {
              id: nanoid(),
              blockId: names.hltSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: nanoid(),
              blockId: names.mtSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: nanoid(),
              blockId: names.bkSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
        {
          name: 'Constant HLT Temp',
          id: nanoid(),
          changes: [
            {
              id: nanoid(),
              serviceId,
              blockId: names.mtSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
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
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
        {
          name: 'Constant MT Temp',
          id: nanoid(),
          changes: [
            {
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
            },
            {
              id: nanoid(),
              serviceId,
              blockId: names.hltDriver,
              data: {
                enabled: true,
              },
              confirmed: {},
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<ActuatorOffsetBlock>,
            ],
        },
        {
          name: 'Constant BK Temp',
          id: nanoid(),
          changes: [
            {
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
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
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
