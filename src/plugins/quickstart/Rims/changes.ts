import { uid } from 'quasar';

import { Link, Unit } from '@/helpers/units';
import { serialize } from '@/helpers/units/parseObject';
import { typeName as builderType } from '@/plugins/builder/getters';
import { BuilderItem, BuilderLayout } from '@/plugins/builder/types';
import { HistoryItem } from '@/plugins/history/Graph/types';
import { typeName as driverType } from '@/plugins/spark/features/ActuatorOffset/getters';
import { ActuatorOffsetBlock, OffsetSettingOrValue } from '@/plugins/spark/features/ActuatorOffset/types';
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
    config.tubePin,
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
      id: config.names.tubeSetpoint,
      type: setpointType,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.tubeSensor),
        storedSetting: opts.tubeSetting,
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
      id: config.names.tubeDriver,
      type: driverType,
      serviceId,
      groups,
      data: {
        targetId: new Link(config.names.tubeSetpoint),
        drivenTargetId: new Link(config.names.tubeSetpoint),
        referenceId: new Link(config.names.kettleSetpoint),
        referenceSettingOrValue: OffsetSettingOrValue.Setting,
        enabled: false,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
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
      id: config.names.tubeAct,
      type: digiActType,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.tubePin.arrayId),
        channel: config.tubePin.pinId,
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
      id: config.names.tubePwm,
      type: pwmType,
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
      id: config.names.tubePid,
      type: pidType,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[pidType].generate() as PidData),
        kp: new Unit(100, '1/degC'),
        ti: new Unit(6, 'hour'),
        td: new Unit(30, 'min'),
        enabled: true,
        inputId: new Link(config.names.tubeSetpoint),
        outputId: new Link(config.names.tubePwm),
      },
    },
  ] as [
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
              blockId: config.names.tubeSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.kettleSetpoint,
              data: { settingEnabled: true },
            },
          ],
        },
        {
          name: 'Enable tube heater',
          id: uid(),
          changes: [
            {
              blockId: config.names.kettleSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.tubeSetpoint,
              data: { settingEnabled: true },
            },
          ],
        },
        {
          name: 'Disable all',
          id: uid(),
          changes: [
            {
              blockId: config.names.tubeSetpoint,
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
