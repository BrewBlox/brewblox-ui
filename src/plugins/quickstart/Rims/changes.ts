import { uid } from 'quasar';

import { Link, Time, Unit } from '@/helpers/units';
import { serialize } from '@/helpers/units/parseObject';
import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  blockTypes,
  DigitalActuatorBlock,
  FilterChoice,
  OffsetSettingOrValue,
  PidBlock,
  PidData,
  SetpointSensorPairBlock,
} from '@/plugins/spark/block-types';
import { BlockChange, QuickActionsConfig } from '@/plugins/spark/features/QuickActions/types';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState } from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { unlinkedActuators, withoutPrefix, withPrefix } from '../helpers';
import { DisplayBlock } from '../types';
import { RimsConfig } from './types';

export function defineChangedBlocks(config: RimsConfig): Block[] {
  return unlinkedActuators(config.serviceId, [
    config.tubePin,
    config.pumpPin,
  ]);
}

export function defineCreatedBlocks(config: RimsConfig): Block[] {
  const groups = [0];
  const serviceId = config.serviceId;

  return [
    // setpoints
    {
      id: config.names.kettleSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.kettleSensor),
        storedSetting: new Unit(67.7, 'degC'),
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
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.tubeSensor),
        storedSetting: new Unit(67.7, 'degC'),
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
        constrainedBy: {
          constraints: [
            {
              max: 10,
              limiting: false,
            },
          ],
        },
      },
    },
    // Digital Actuators
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
        constrainedBy: { constraints: [] },
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
      id: config.names.tubePwm,
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Time(10, 's'),
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
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        kp: new Unit(10, '1/degC'),
        ti: new Time(5, 'min'),
        td: new Time(30, 's'),
        enabled: true,
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
        kp: new Unit(30, '1/degC'),
        ti: new Time(2, 'min'),
        td: new Time(10, 's'),
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
      ActuatorPwmBlock,
      PidBlock,
      PidBlock,
    ];
}

export function defineWidgets(config: RimsConfig, layouts: BuilderLayout[]): Widget[] {
  const userTemp = sparkStore.units(config.serviceId).Temp;

  const createWidget = (name: string, type: string): Widget => ({
    ...featureStore.widgetSize(type),
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

  const builder: Widget<BuilderConfig> = {
    ...createWidget(withPrefix(config.prefix, 'Process'), 'Builder'),
    cols: 5,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map(l => l.id),
    },
  };

  const graph: Widget<GraphConfig> = {
    ...createWidget(withPrefix(config.prefix, 'Graph'), 'Graph'),
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
            `${config.names.tubePwm}/value`,
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
        [`${config.serviceId}/${config.names.tubePwm}/value`]: 'Tube element PWM value',
        [`${config.serviceId}/${config.names.tubeAct}/state`]: 'Tube element active',
        [`${config.serviceId}/${config.names.pumpAct}/state`]: 'Pump active',
      },
      axes: {
        [`${config.serviceId}/${config.names.tubePwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.tubeAct}/state`]: 'y2',
        [`${config.serviceId}/${config.names.pumpAct}/state`]: 'y2',
      },
      colors: {},
    },
  };

  const QuickActions: Widget<QuickActionsConfig> = {
    ...createWidget(withPrefix(config.prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      changeIdMigrated: true,
      serviceId: config.serviceId,
      steps: serialize([
        {
          name: 'Enable pump and heater',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: config.names.pumpAct,
              data: { desiredState: DigitalState.Active },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: config.names.kettleSetpoint,
              data: { settingEnabled: true },
              confirmed: {},
            },
          ] as [
              BlockChange<DigitalActuatorBlock>,
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
        {
          name: 'Disable pump and heater',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: config.names.kettleSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: config.names.pumpAct,
              data: { desiredState: DigitalState.Inactive },
              confirmed: {},
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<DigitalActuatorBlock>,
            ],
        },
        {
          name: 'Enable pump',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: config.names.pumpAct,
              data: { desiredState: DigitalState.Active },
              confirmed: {},
            },
          ] as [
              BlockChange<DigitalActuatorBlock>,
            ],
        },
        {
          name: 'Disable heater',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: config.names.kettleSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
      ]),
    },
  };

  return [
    builder,
    graph,
    QuickActions,
  ];
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
