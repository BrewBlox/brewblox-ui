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
import { AnalogConstraint, DigitalConstraint } from '@/plugins/spark/components/Constraints/ConstraintsBase';
import { StepViewItem } from '@/plugins/spark/features/StepView/types';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { unlinkedActuators } from '../helpers';
import { RimsConfig, RimsOpts } from './types';

export function defineChangedBlocks(config: RimsConfig): Block[] {
  return unlinkedActuators(config.serviceId, [
    config.kettlePin,
    config.tubePin,
    config.pumpPin,
  ]);
}

export function defineCreatedBlocks(config: RimsConfig, opts: RimsOpts): Block[] {
  const groups = [0];
  const serviceId = config.serviceId;

  const pwmConstraints: AnalogConstraint[] = [
    {
      balanced: {
        balancerId: new Link(config.names.balancer, blockTypes.Balancer),
        granted: 0,
        id: 0,
      },
      limiting: false,
    },
  ];

  const heaterConstraints: DigitalConstraint[] = [
    { mutex: new Link(config.names.mutex, blockTypes.Mutex), limiting: false },
  ];

  return [
    // Mutex
    {
      id: config.names.mutex,
      type: blockTypes.Mutex,
      serviceId,
      groups,
      data: {
        differentActuatorWait: new Unit(0, 'second'),
      },
    },
    // Balancer
    {
      id: config.names.balancer,
      type: blockTypes.Balancer,
      serviceId,
      groups,
      data: { clients: [] },
    },
    // setpoints
    {
      id: config.names.kettleSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.kettleSensor),
        storedSetting: opts.kettleSetting,
        settingEnabled: true,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    {
      id: config.names.tubeSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.tubeSensor),
        storedSetting: opts.kettleSetting,
        settingEnabled: true,
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
      id: config.names.tubeDriver,
      type: blockTypes.SetpointDriver,
      serviceId,
      groups,
      data: {
        targetId: new Link(config.names.tubeSetpoint),
        drivenTargetId: new Link(config.names.tubeSetpoint),
        referenceId: new Link(config.names.kettleSetpoint),
        referenceSettingOrValue: OffsetSettingOrValue.Setting,
        enabled: true,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
      },
    },
    // Digital Actuators
    {
      id: config.names.kettleAct,
      type: blockTypes.DigitalActuator,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.kettlePin.arrayId),
        channel: config.kettlePin.pinId,
        invert: false,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        constrainedBy: { constraints: heaterConstraints },
      },
    },
    {
      id: config.names.tubeAct,
      type: blockTypes.DigitalActuator,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.tubePin.arrayId),
        channel: config.tubePin.pinId,
        invert: false,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        constrainedBy: { constraints: heaterConstraints },
      },
    },
    {
      id: config.names.pumpAct,
      type: blockTypes.DigitalActuator,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.pumpPin.arrayId),
        channel: config.pumpPin.pinId,
        invert: false,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        constrainedBy: { constraints: [] },
      },
    },
    // PWM
    {
      id: config.names.kettlePwm,
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(10, 'second'),
        actuatorId: new Link(config.names.kettleAct),
        drivenActuatorId: new Link(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: pwmConstraints },
      },
    },
    {
      id: config.names.tubePwm,
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(10, 'second'),
        actuatorId: new Link(config.names.tubeAct),
        drivenActuatorId: new Link(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: pwmConstraints },
      },
    },
    // PID
    {
      id: config.names.kettlePid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        kp: new Unit(100, '1/degC'),
        ti: new Unit(6, 'hour'),
        td: new Unit(30, 'min'),
        enabled: false,
        inputId: new Link(config.names.kettleSetpoint),
        outputId: new Link(config.names.kettlePwm),
      },
    },
    {
      id: config.names.tubeDriverPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        kp: new Unit(100, '1/degC'),
        ti: new Unit(6, 'hour'),
        td: new Unit(30, 'min'),
        enabled: false,
        inputId: new Link(config.names.kettleSetpoint),
        outputId: new Link(config.names.tubeDriver),
      },
    },
    {
      id: config.names.tubePid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        kp: new Unit(100, '1/degC'),
        ti: new Unit(6, 'hour'),
        td: new Unit(30, 'min'),
        enabled: false,
        inputId: new Link(config.names.tubeSetpoint),
        outputId: new Link(config.names.tubePwm),
      },
    },
  ] as [
      MutexBlock,
      BalancerBlock,
      SetpointSensorPairBlock,
      SetpointSensorPairBlock,
      ActuatorOffsetBlock,
      DigitalActuatorBlock,
      DigitalActuatorBlock,
      DigitalActuatorBlock,
      ActuatorPwmBlock,
      ActuatorPwmBlock,
      PidBlock,
      PidBlock,
      PidBlock,
    ];
}

export function defineWidgets(config: RimsConfig, layouts: BuilderLayout[]): DashboardItem[] {
  const userTemp = sparkStore.units(config.serviceId).Temp;

  const createWidget = (name: string, type: string): DashboardItem => ({
    ...featureStore.widgetSizeById(type),
    dashboard: config.dashboardId,
    id: uid(),
    title: name,
    feature: type,
    order: 0,
    config: {
      blockId: name,
      serviceId: config.serviceId,
    },
  });

  const builder: BuilderItem = {
    ...createWidget(config.title, 'Builder'),
    cols: 5,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentToolId: 'config',
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map(l => l.id),
    },
  };

  const graph: HistoryItem = {
    ...createWidget(`${config.prefix} Graph`, 'Graph'),
    cols: 6,
    rows: 5,
    pinnedPosition: { x: 6, y: 1 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: config.serviceId,
          fields: [
            `${config.names.kettleSensor}/value[${userTemp}]`,
            `${config.names.tubeSensor}/value[${userTemp}]`,
            `${config.names.kettleSetpoint}/setting[${userTemp}]`,
            `${config.names.tubeSetpoint}/setting[${userTemp}]`,
            `${config.names.kettlePwm}/value`,
            `${config.names.tubePwm}/value`,
            `${config.names.kettleAct}/state`,
            `${config.names.tubeAct}/state`,
            `${config.names.pumpAct}/state`,
          ],
        },
      ],
      renames: {
        [`${config.serviceId}/${config.names.kettleSensor}/value[${userTemp}]`]: 'Kettle temperature',
        [`${config.serviceId}/${config.names.tubeSensor}/value[${userTemp}]`]: 'Tube temperature',
        [`${config.serviceId}/${config.names.kettleSetpoint}/setting[${userTemp}]`]: 'Kettle setting',
        [`${config.serviceId}/${config.names.tubeSetpoint}/setting[${userTemp}]`]: 'Tube setting',
        [`${config.serviceId}/${config.names.kettlePwm}/value`]: 'Kettle PWM value',
        [`${config.serviceId}/${config.names.tubePwm}/value`]: 'Tube PWM value',
        [`${config.serviceId}/${config.names.kettleAct}/state`]: 'Kettle Pin state',
        [`${config.serviceId}/${config.names.tubeAct}/state`]: 'Tube Pin state',
        [`${config.serviceId}/${config.names.pumpAct}/state`]: 'Pump Pin state',
      },
      axes: {
        [`${config.serviceId}/${config.names.kettlePwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.tubePwm}/value`]: 'y2',
      },
      colors: {},
    },
  };

  const stepView: StepViewItem = {
    ...createWidget(`${config.prefix} Actions`, 'StepView'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      serviceId: config.serviceId,
      steps: serialize([
        {
          name: 'Enable kettle heater',
          id: uid(),
          changes: [
            {
              blockId: config.names.tubePid,
              data: { enabled: false },
            },
            {
              blockId: config.names.tubeDriverPid,
              data: { enabled: false },
            },
            {
              blockId: config.names.kettlePid,
              data: { enabled: true },
            },
          ],
        },
        {
          name: 'Enable tube heater + pump',
          id: uid(),
          changes: [
            {
              blockId: config.names.pumpAct,
              data: { desiredState: DigitalState.Active },
            },
            {
              blockId: config.names.tubePid,
              data: { enabled: true },
            },
            {
              blockId: config.names.tubeDriverPid,
              data: { enabled: true },
            },
            {
              blockId: config.names.kettlePid,
              data: { enabled: false },
            },
          ],
        },
        {
          name: 'Enable pump',
          id: uid(),
          changes: [
            {
              blockId: config.names.pumpAct,
              data: { desiredState: DigitalState.Active },
            },
          ],
        },
        {
          name: 'Disable pump',
          id: uid(),
          changes: [
            {
              blockId: config.names.pumpAct,
              data: { desiredState: DigitalState.Inactive },
            },
          ],
        },
        {
          name: 'Disable all',
          id: uid(),
          changes: [
            {
              blockId: config.names.tubePid,
              data: { enabled: false },
            },
            {
              blockId: config.names.tubeDriverPid,
              data: { enabled: false },
            },
            {
              blockId: config.names.kettlePid,
              data: { enabled: false },
            },
            {
              blockId: config.names.pumpAct,
              data: { desiredState: DigitalState.Inactive },
            },
          ],
        },
      ]),
    },
  };

  return [
    builder,
    graph,
    stepView,
  ];
}
