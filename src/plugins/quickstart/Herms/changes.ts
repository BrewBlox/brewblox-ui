import { uid } from 'quasar';

import { Link, Temp, Time, Unit } from '@/helpers/units';
import { serialize } from '@/helpers/units/parseObject';
import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  BalancerBlock,
  blockTypes,
  DigitalActuatorBlock,
  FilterChoice,
  MutexBlock,
  OffsetSettingOrValue,
  PidBlock,
  SetpointSensorPairBlock,
} from '@/plugins/spark/block-types';
import { BlockChange, QuickActionsConfig } from '@/plugins/spark/features/QuickActions/types';
import { sparkStore } from '@/plugins/spark/store';
import { AnalogConstraint, Block, DigitalConstraint, DigitalState } from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { pidDefaults, unlinkedActuators, withoutPrefix, withPrefix } from '../helpers';
import { DisplayBlock } from '../types';
import { HermsConfig, HermsOpts } from './types';

export function defineChangedBlocks(config: HermsConfig): Block[] {
  return unlinkedActuators(config.serviceId, [config.hltPin, config.bkPin]);
};

export function defineCreatedBlocks(config: HermsConfig, opts: HermsOpts): Block[] {
  const groups = [0];
  const { serviceId, names } = config;

  const pwmConstraints: AnalogConstraint[] = [];
  const actuatorConstraints: DigitalConstraint[] = [];

  if (config.mutex) {
    pwmConstraints.push({
      balanced: {
        balancerId: new Link(names.balancer, blockTypes.Balancer),
        granted: 0,
        id: 0,
      },
      limiting: false,
    });
    actuatorConstraints.push(
      {
        mutexed: {
          mutexId: new Link(names.mutex, blockTypes.Mutex),
          extraHoldTime: new Time(),
          hasCustomHoldTime: true,
          hasLock: false,
        },
        remaining: new Time(),
      },
    );
  }

  const balancerBlocks = [
    {
      id: names.balancer,
      type: blockTypes.Balancer,
      serviceId,
      groups,
      data: { clients: [] },
    },
    {
      id: names.mutex,
      type: blockTypes.Mutex,
      serviceId,
      groups,
      data: {
        differentActuatorWait: new Time(),
        waitRemaining: new Time(),
      },
    },
  ] as [
      BalancerBlock,
      MutexBlock,
    ];

  const baseBlocks = [
    // Setpoints
    {
      id: names.hltSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(names.hltSensor),
        storedSetting: new Unit(70, 'degC'),
        settingEnabled: false,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    {
      id: names.mtSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(names.mtSensor),
        storedSetting: new Unit(67, 'degC'),
        settingEnabled: false,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    {
      id: names.bkSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(names.bkSensor),
        storedSetting: new Unit(70, 'degC'),
        settingEnabled: false,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    // Setpoint Driver
    {
      id: names.hltDriver,
      type: blockTypes.SetpointDriver,
      serviceId,
      groups,
      data: {
        targetId: new Link(names.hltSetpoint),
        drivenTargetId: new Link(names.hltSetpoint),
        referenceId: new Link(names.mtSetpoint),
        referenceSettingOrValue: OffsetSettingOrValue.Setting,
        enabled: false,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: {
          constraints: [
            {
              max: opts.driverMax.value,
              limiting: false,
            },
          ],
        },
      },
    },
    // Digital Actuators
    {
      id: names.hltAct,
      type: blockTypes.DigitalActuator,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.hltPin.arrayId),
        channel: config.hltPin.pinId,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        invert: false,
        constrainedBy: {
          constraints: actuatorConstraints,
        },
      },
    },
    {
      id: names.bkAct,
      type: blockTypes.DigitalActuator,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.bkPin.arrayId),
        channel: config.bkPin.pinId,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        invert: false,
        constrainedBy: {
          constraints: actuatorConstraints,
        },
      },
    },
    // PWM
    {
      id: names.hltPwm,
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Time(2, 's'),
        actuatorId: new Link(names.hltAct),
        drivenActuatorId: new Link(null),
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
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Time(2, 's'),
        actuatorId: new Link(names.bkAct),
        drivenActuatorId: new Link(null),
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
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...pidDefaults(),
        enabled: true,
        inputId: new Link(names.hltSetpoint),
        outputId: new Link(names.hltPwm),
        kp: opts.hltKp,
        ti: new Time(10, 'min'),
        td: new Time(30, 's'),
        boilMinOutput: 25,
      },
    },
    {
      id: names.mtPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...pidDefaults(),
        enabled: true,
        inputId: new Link(names.mtSetpoint),
        outputId: new Link(names.hltDriver),
        kp: opts.mtKp,
        ti: new Time(5, 'min'),
        td: new Time(10, 'min'),
      },
    },
    {
      id: names.bkPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...pidDefaults(),
        enabled: true,
        inputId: new Link(names.bkSetpoint),
        outputId: new Link(names.bkPwm),
        kp: opts.bkKp,
        ti: new Time(5, 'min'),
        td: new Time(10, 'min'),
        boilMinOutput: 25,
      },
    },
  ] as [
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
    ];

  return config.mutex
    ? [...balancerBlocks, ...baseBlocks]
    : baseBlocks;
}


export function defineWidgets(config: HermsConfig, layouts: BuilderLayout[]): Widget[] {
  const { serviceId, names, dashboardId, prefix } = config;
  const userTemp = sparkStore.moduleById(serviceId)!.units.Temp;
  const genericSettings = {
    dashboard: dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const createWidget = (name: string, type: string): Widget => ({
    ...genericSettings,
    ...featureStore.widgetSize(type),
    id: uid(),
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
    },
  });

  const createQuickActions = (): Widget<QuickActionsConfig> => ({
    ...createWidget(withPrefix(prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 8, y: 6 },
    config: {
      changeIdMigrated: true,
      serviceId: serviceId,
      steps: serialize([
        {
          name: 'Disable all setpoints',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.hltSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: names.mtSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
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
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.mtSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: names.hltSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Temp(70, 'degC').convert(userTemp),
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
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.mtSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Temp(66.7, 'degC').convert(userTemp),
              },
              confirmed: {
                storedSetting: true,
              },
            },
            {
              id: uid(),
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
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.bkSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Temp(100, 'degC').convert(userTemp),
              },
              confirmed: {
                storedSetting: true,
              },
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
      ]),
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
