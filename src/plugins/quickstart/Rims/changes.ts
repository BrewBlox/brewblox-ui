import { uid } from 'quasar';

import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import { Link, Qty, Time } from '@/plugins/spark/bloxfield';
import { BlockChange, QuickActionsConfig } from '@/plugins/spark/features/QuickActions/types';
import { serialize } from '@/plugins/spark/parse-object';
import { sparkStore } from '@/plugins/spark/store';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  Block,
  DigitalActuatorBlock,
  DigitalState,
  FilterChoice,
  PidBlock,
  ReferenceKind,
  SetpointSensorPairBlock,
} from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { pidDefaults, unlinkedActuators, withoutPrefix, withPrefix } from '../helpers';
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
  const { serviceId, names } = config;

  const blocks: [
    SetpointSensorPairBlock,
    SetpointSensorPairBlock,
    ActuatorOffsetBlock,
    DigitalActuatorBlock,
    DigitalActuatorBlock,
    ActuatorPwmBlock,
    PidBlock,
    PidBlock,
  ] = [
      // setpoints
      {
        id: names.kettleSetpoint,
        type: 'SetpointSensorPair',
        serviceId,
        groups,
        data: {
          sensorId: new Link(names.kettleSensor),
          storedSetting: new Qty(67.7, 'degC'),
          settingEnabled: false,
          setting: new Qty(null, 'degC'),
          value: new Qty(null, 'degC'),
          valueUnfiltered: new Qty(null, 'degC'),
          filter: FilterChoice.FILTER_15s,
          filterThreshold: new Qty(5, 'delta_degC'),
          resetFilter: false,
        },
      },
      {
        id: names.tubeSetpoint,
        type: 'SetpointSensorPair',
        serviceId,
        groups,
        data: {
          sensorId: new Link(names.tubeSensor),
          storedSetting: new Qty(67.7, 'degC'),
          settingEnabled: true,
          setting: new Qty(null, 'degC'),
          value: new Qty(null, 'degC'),
          valueUnfiltered: new Qty(null, 'degC'),
          filter: FilterChoice.FILTER_15s,
          filterThreshold: new Qty(5, 'delta_degC'),
          resetFilter: false,
        },
      },
      // Setpoint Driver
      {
        id: names.tubeDriver,
        type: 'ActuatorOffset',
        serviceId,
        groups,
        data: {
          targetId: new Link(names.tubeSetpoint),
          drivenTargetId: new Link(names.tubeSetpoint),
          referenceId: new Link(names.kettleSetpoint),
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
        },
      },
      // Digital Actuators
      {
        id: names.tubeAct,
        type: 'DigitalActuator',
        serviceId,
        groups,
        data: {
          hwDevice: new Link(config.tubePin.arrayId),
          channel: config.tubePin.pinId,
          invert: false,
          desiredState: DigitalState.STATE_INACTIVE,
          state: DigitalState.STATE_INACTIVE,
          constrainedBy: { constraints: [] },
        },
      },
      {
        id: names.pumpAct,
        type: 'DigitalActuator',
        serviceId,
        groups,
        data: {
          hwDevice: new Link(config.pumpPin.arrayId),
          channel: config.pumpPin.pinId,
          invert: false,
          desiredState: DigitalState.STATE_INACTIVE,
          state: DigitalState.STATE_INACTIVE,
          constrainedBy: { constraints: [] },
        },
      },
      // PWM
      {
        id: names.tubePwm,
        type: 'ActuatorPwm',
        serviceId,
        groups,
        data: {
          enabled: true,
          period: new Time(10, 's'),
          actuatorId: new Link(names.tubeAct),
          drivenActuatorId: new Link(null),
          setting: 0,
          desiredSetting: 0,
          value: 0,
          constrainedBy: { constraints: [] },
        },
      },
      // PID
      {
        id: names.kettlePid,
        type: 'Pid',
        serviceId,
        groups,
        data: {
          ...pidDefaults(serviceId),
          kp: new Qty(10, '1/degC'),
          ti: new Time(5, 'min'),
          td: new Time(30, 's'),
          enabled: true,
          inputId: new Link(names.kettleSetpoint),
          outputId: new Link(names.tubeDriver),
        },
      },
      {
        id: names.tubePid,
        type: 'Pid',
        serviceId,
        groups,
        data: {
          ...pidDefaults(serviceId),
          kp: new Qty(30, '1/degC'),
          ti: new Time(2, 'min'),
          td: new Time(10, 's'),
          enabled: true,
          inputId: new Link(names.tubeSetpoint),
          outputId: new Link(names.tubePwm),
        },
      },
    ];
  return blocks;
}

export function defineWidgets(config: RimsConfig, layouts: BuilderLayout[]): Widget[] {
  const { serviceId, dashboardId, names, prefix } = config;
  const userTemp = sparkStore.moduleById(serviceId)!.units.Temp;

  const createWidget = (name: string, type: string): Widget => ({
    ...featureStore.widgetSize(type),
    dashboard: dashboardId,
    id: uid(),
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
      layoutIds: layouts.map(l => l.id),
    },
  };

  const graph: Widget<GraphConfig> = {
    ...createWidget(withPrefix(prefix, 'Graph'), 'Graph'),
    cols: 6,
    rows: 5,
    pinnedPosition: { x: 6, y: 1 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: serviceId,
          fields: [
            `${names.kettleSensor}/value[${userTemp}]`,
            `${names.tubeSensor}/value[${userTemp}]`,
            `${names.kettleSetpoint}/setting[${userTemp}]`,
            `${names.tubeSetpoint}/setting[${userTemp}]`,
            `${names.tubePwm}/value`,
            `${names.tubeAct}/state`,
            `${names.pumpAct}/state`,
          ],
        },
      ],
      renames: {
        [`${serviceId}/${names.kettleSensor}/value[${userTemp}]`]: 'Kettle temperature',
        [`${serviceId}/${names.tubeSensor}/value[${userTemp}]`]: 'Tube temperature',
        [`${serviceId}/${names.kettleSetpoint}/setting[${userTemp}]`]: 'Kettle setting',
        [`${serviceId}/${names.tubeSetpoint}/setting[${userTemp}]`]: 'Tube setting',
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
    },
  };

  const QuickActions: Widget<QuickActionsConfig> = {
    ...createWidget(withPrefix(prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      serviceId,
      changeIdMigrated: true,
      serviceIdMigrated: true,
      actions: serialize([
        {
          name: 'Enable pump and heater',
          id: uid(),
          changes: [
            {
              id: uid(),
              serviceId,
              blockId: names.pumpAct,
              data: { desiredState: DigitalState.STATE_ACTIVE },
              confirmed: {},
            },
            {
              id: uid(),
              serviceId,
              blockId: names.kettleSetpoint,
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
              serviceId,
              blockId: names.kettleSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              serviceId,
              blockId: names.pumpAct,
              data: { desiredState: DigitalState.STATE_INACTIVE },
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
              serviceId,
              blockId: names.pumpAct,
              data: { desiredState: DigitalState.STATE_ACTIVE },
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
              serviceId,
              blockId: names.kettleSetpoint,
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
