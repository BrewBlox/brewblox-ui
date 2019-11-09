import { uid } from 'quasar';

import { Link, Unit } from '@/helpers/units';
import { serialize } from '@/helpers/units/parseObject';
import { BuilderItem, BuilderLayout } from '@/plugins/builder/types';
import { HistoryItem } from '@/plugins/history/Graph/types';
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
  PidData,
  SetpointSensorPairBlock,
} from '@/plugins/spark/block-types';
import { QuickActionsItem } from '@/plugins/spark/features/QuickActions/types';
import { sparkStore } from '@/plugins/spark/store';
import { AnalogConstraint, Block, DigitalConstraint, DigitalState } from '@/plugins/spark/types';
import { PersistentWidget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { maybeSpace, unlinkedActuators } from '../helpers';
import { HermsConfig, HermsOpts } from './types';

export function defineChangedBlocks(config: HermsConfig): Block[] {
  return unlinkedActuators(config.serviceId, [config.hltPin, config.bkPin]);
};

export function defineCreatedBlocks(config: HermsConfig, opts: HermsOpts): Block[] {
  const groups = [0];
  const serviceId = config.serviceId;

  const pwmConstraints: AnalogConstraint[] = [];
  const actuatorConstraints: DigitalConstraint[] = [];

  if (config.mutex) {
    pwmConstraints.push({
      balanced: {
        balancerId: new Link(config.names.balancer, blockTypes.Balancer),
        granted: 0,
        id: 0,
      },
      limiting: false,
    });
    actuatorConstraints.push(
      { mutex: new Link(config.names.mutex, blockTypes.Mutex), limiting: false }
    );
  }

  const balancerBlocks = [
    {
      id: config.names.balancer,
      type: blockTypes.Balancer,
      serviceId,
      groups,
      data: { clients: [] },
    },
    {
      id: config.names.mutex,
      type: blockTypes.Mutex,
      serviceId,
      groups,
      data: {
        differentActuatorWait: new Unit(0, 'second'),
      },
    },
  ] as [
      BalancerBlock,
      MutexBlock,
    ];

  const baseBlocks = [
    // Setpoints
    {
      id: config.names.hltSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.hltSensor),
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
      id: config.names.mtSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.mtSensor),
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
      id: config.names.bkSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.bkSensor),
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
      id: config.names.hltDriver,
      type: blockTypes.SetpointDriver,
      serviceId,
      groups,
      data: {
        targetId: new Link(config.names.hltSetpoint),
        drivenTargetId: new Link(config.names.hltSetpoint),
        referenceId: new Link(config.names.mtSetpoint),
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
      id: config.names.hltAct,
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
      id: config.names.bkAct,
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
      id: config.names.hltPwm,
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(2, 'second'),
        actuatorId: new Link(config.names.hltAct),
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
      id: config.names.bkPwm,
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(2, 'second'),
        actuatorId: new Link(config.names.bkAct),
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
      id: config.names.hltPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        enabled: true,
        inputId: new Link(config.names.hltSetpoint),
        outputId: new Link(config.names.hltPwm),
        kp: opts.hltKp,
        ti: new Unit(10, 'min'),
        td: new Unit(30, 'second'),
        boilMinOutput: 25,
      },
    },
    {
      id: config.names.mtPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        enabled: true,
        inputId: new Link(config.names.mtSetpoint),
        outputId: new Link(config.names.hltDriver),
        kp: opts.mtKp,
        ti: new Unit(5, 'min'),
        td: new Unit(10, 'min'),
      },
    },
    {
      id: config.names.bkPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        enabled: true,
        inputId: new Link(config.names.bkSetpoint),
        outputId: new Link(config.names.bkPwm),
        kp: opts.bkKp,
        ti: new Unit(5, 'min'),
        td: new Unit(10, 'min'),
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


export function defineWidgets(config: HermsConfig, layouts: BuilderLayout[]): PersistentWidget[] {
  const userTemp = sparkStore.units(config.serviceId).Temp;
  const genericSettings = {
    dashboard: config.dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const createWidget = (name: string, type: string): PersistentWidget => ({
    ...genericSettings,
    ...featureStore.widgetSize(type),
    id: uid(),
    title: name,
    feature: type,
    order: 0,
    config: {
      blockId: name,
      serviceId: config.serviceId,
    },
  });

  const createBuilder = (): BuilderItem => ({
    ...createWidget(maybeSpace(config.prefix, 'Process'), 'Builder'),
    cols: 11,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map(l => l.id),
    },
  });

  const createGraph = (): HistoryItem => ({
    ...createWidget(maybeSpace(config.prefix, 'Graph'), 'Graph'),
    cols: 7,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: config.serviceId,
          fields: [
            `${config.names.hltSensor}/value[${userTemp}]`,
            `${config.names.mtSensor}/value[${userTemp}]`,
            `${config.names.bkSensor}/value[${userTemp}]`,
            `${config.names.hltSetpoint}/setting[${userTemp}]`,
            `${config.names.mtSetpoint}/setting[${userTemp}]`,
            `${config.names.bkSetpoint}/setting[${userTemp}]`,
            `${config.names.hltPwm}/value`,
            `${config.names.bkPwm}/value`,
          ],
        },
      ],
      renames: {
        [`${config.serviceId}/${config.names.hltSensor}/value[${userTemp}]`]: 'HLT temperature',
        [`${config.serviceId}/${config.names.mtSensor}/value[${userTemp}]`]: 'MT temperature',
        [`${config.serviceId}/${config.names.bkSensor}/value[${userTemp}]`]: 'BK temperature',
        [`${config.serviceId}/${config.names.hltSetpoint}/setting[${userTemp}]`]: 'HLT setting',
        [`${config.serviceId}/${config.names.mtSetpoint}/setting[${userTemp}]`]: 'MT setting',
        [`${config.serviceId}/${config.names.bkSetpoint}/setting[${userTemp}]`]: 'BK setting',
        [`${config.serviceId}/${config.names.hltPwm}/value`]: 'HLT PWM value',
        [`${config.serviceId}/${config.names.bkPwm}/value`]: 'BK PWM value',
      },
      axes: {
        [`${config.serviceId}/${config.names.hltPwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.bkPwm}/value`]: 'y2',
      },
      colors: {},
    },
  });

  const createQuickActions = (): QuickActionsItem => ({
    ...createWidget(maybeSpace(config.prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 8, y: 6 },
    config: {
      serviceId: config.serviceId,
      steps: serialize([
        {
          name: 'Disable all setpoints',
          id: uid(),
          changes: [
            {
              blockId: config.names.hltSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.mtSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.bkSetpoint,
              data: { settingEnabled: false },
            },
          ],
        },
        {
          name: 'Constant HLT Temp',
          id: uid(),
          changes: [
            {
              blockId: config.names.mtSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.hltSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Unit(70, 'degC'),
              },
              confirmed: {
                storedSetting: true,
              },
            },
          ],
        },
        {
          name: 'Constant MT Temp',
          id: uid(),
          changes: [
            {
              blockId: config.names.mtSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Unit(66.7, 'degC'),
              },
              confirmed: {
                storedSetting: true,
              },
            },
            {
              blockId: config.names.hltDriver,
              data: {
                enabled: true,
              },
            },
          ],
        },
        {
          name: 'Constant BK Temp',
          id: uid(),
          changes: [
            {
              blockId: config.names.bkSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Unit(100, 'degC'),
              },
              confirmed: {
                storedSetting: true,
              },
            },
          ],
        },
      ]),
    },
  });

  return [createBuilder(), createGraph(), createQuickActions()];
}
