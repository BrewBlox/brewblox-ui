import { uid } from 'quasar';

import { Link, Unit } from '@/helpers/units';
import { serialize } from '@/helpers/units/parseObject';
import { typeName as builderType } from '@/plugins/builder/getters';
import { BuilderItem, BuilderLayout } from '@/plugins/builder/types';
import { HistoryItem } from '@/plugins/history/Graph/types';
import { typeName as pwmType } from '@/plugins/spark/features/ActuatorPwm/getters';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';
import { typeName as digiActType } from '@/plugins/spark/features/DigitalActuator/getters';
import { DigitalActuatorBlock } from '@/plugins/spark/features/DigitalActuator/types';
import { typeName as pidType } from '@/plugins/spark/features/Pid/getters';
import { PidBlock, PidData } from '@/plugins/spark/features/Pid/types';
import { typeName as setpointType } from '@/plugins/spark/features/SetpointSensorPair/getters';
import { FilterChoice, SetpointSensorPairBlock } from '@/plugins/spark/features/SetpointSensorPair/types';
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
    config.mashPin,
    config.pumpPin,
  ]);
}

export function defineCreatedBlocks(config: RimsConfig, opts: RimsOpts): Block[] {
  const groups = [0];
  const serviceId = config.serviceId;

  return [
    // setpoints
    {
      id: config.names.kettleSetpoint,
      type: setpointType,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.kettleSensor),
        storedSetting: opts.kettleSetting,
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
      id: config.names.mashSetpoint,
      type: setpointType,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.kettleSensor),
        storedSetting: opts.mashSetting,
        settingEnabled: false,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    // Digital Actuators
    {
      id: config.names.kettleAct,
      type: digiActType,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.kettlePin.arrayId),
        channel: config.kettlePin.pinId,
        invert: false,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        constrainedBy: { constraints: [] },
      },
    },
    {
      id: config.names.mashAct,
      type: digiActType,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.mashPin.arrayId),
        channel: config.mashPin.pinId,
        invert: false,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        constrainedBy: { constraints: [] },
      },
    },
    {
      id: config.names.pumpAct,
      type: digiActType,
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
      type: pwmType,
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
        constrainedBy: { constraints: [] },
      },
    },
    {
      id: config.names.mashPwm,
      type: pwmType,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(10, 'second'),
        actuatorId: new Link(config.names.mashAct),
        drivenActuatorId: new Link(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
      },
    },
    // PID
    {
      id: config.names.kettlePid,
      type: pidType,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[pidType].generate() as PidData),
        kp: new Unit(100, '1/degC'),
        ti: new Unit(6, 'hour'),
        td: new Unit(30, 'min'),
        enabled: true,
        inputId: new Link(config.names.kettleSetpoint),
        outputId: new Link(config.names.kettlePwm),
      },
    },
    {
      id: config.names.mashPid,
      type: pidType,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[pidType].generate() as PidData),
        kp: new Unit(100, '1/degC'),
        ti: new Unit(6, 'hour'),
        td: new Unit(30, 'min'),
        enabled: true,
        inputId: new Link(config.names.mashSetpoint),
        outputId: new Link(config.names.mashPwm),
      },
    },
  ] as [
      SetpointSensorPairBlock,
      SetpointSensorPairBlock,
      DigitalActuatorBlock,
      DigitalActuatorBlock,
      DigitalActuatorBlock,
      ActuatorPwmBlock,
      ActuatorPwmBlock,
      PidBlock,
      PidBlock,
    ];
}

export function defineLayouts(config: RimsConfig): BuilderLayout[] {
  return [
    {
      id: uid(),
      title: `${config.prefix} Kettle`,
      width: 28,
      height: 15,
      parts: [],
    },
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
    ...createWidget(config.title, builderType),
    cols: 10,
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
    pinnedPosition: { x: 5, y: 6 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: config.serviceId,
          fields: [
            `${config.names.kettleSensor}/value[${userTemp}]`,
            `${config.names.kettleSetpoint}/setting[${userTemp}]`,
            `${config.names.mashSetpoint}/setting[${userTemp}]`,
            `${config.names.kettlePwm}/value`,
            `${config.names.mashPwm}/value`,
            `${config.names.kettleAct}/state`,
            `${config.names.mashAct}/state`,
            `${config.names.pumpAct}/state`,
          ],
        },
      ],
      renames: {
        [`${config.serviceId}/${config.names.kettleSensor}/value[${userTemp}]`]: 'Wort temperature',
        [`${config.serviceId}/${config.names.kettleSetpoint}/setting[${userTemp}]`]: 'Kettle setting',
        [`${config.serviceId}/${config.names.mashSetpoint}/setting[${userTemp}]`]: 'Mash setting',
        [`${config.serviceId}/${config.names.kettlePwm}/value`]: 'Kettle PWM value',
        [`${config.serviceId}/${config.names.mashPwm}/value`]: 'Mash PWM value',
        [`${config.serviceId}/${config.names.kettleAct}/state`]: 'Kettle Pin state',
        [`${config.serviceId}/${config.names.mashAct}/state`]: 'Mash Pin state',
        [`${config.serviceId}/${config.names.pumpAct}/state`]: 'Pump Pin state',
      },
      axes: {
        [`${config.serviceId}/${config.names.kettlePwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.mashPwm}/value`]: 'y2',
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
              blockId: config.names.mashSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.kettleSetpoint,
              data: { settingEnabled: true },
            },
          ],
        },
        {
          name: 'Enable mash heater',
          id: uid(),
          changes: [
            {
              blockId: config.names.kettleSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.mashSetpoint,
              data: { settingEnabled: true },
            },
          ],
        },
        {
          name: 'Disable all',
          id: uid(),
          changes: [
            {
              blockId: config.names.mashSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.kettleSetpoint,
              data: { settingEnabled: false },
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
