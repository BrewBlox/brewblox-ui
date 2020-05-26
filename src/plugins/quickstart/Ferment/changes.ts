import { uid } from 'quasar';

import { durationMs } from '@/helpers/functional';
import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import { BlockChange, QuickActionsConfig } from '@/plugins/spark/features/QuickActions/types';
import { blockTypes } from '@/plugins/spark/getters';
import { sparkStore } from '@/plugins/spark/store';
import {
  ActuatorPwmBlock,
  DigitalActuatorBlock,
  FilterChoice,
  MutexBlock,
  PidBlock,
  PidData,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from '@/plugins/spark/types';
import { Block, DigitalState } from '@/plugins/spark/types';
import { Link, Time, Unit } from '@/plugins/spark/units';
import { serialize } from '@/plugins/spark/units/parseObject';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { pidDefaults, unlinkedActuators, withoutPrefix, withPrefix } from '../helpers';
import { DisplayBlock } from '../types';
import { FermentConfig, FermentOpts } from './types';


const beerCoolConfig: Partial<PidData> = {
  kp: new Unit(-50, '1/degC'),
  ti: new Unit(6, 'hour'),
  td: new Unit(30, 'min'),
};

const fridgeCoolConfig: Partial<PidData> = {
  kp: new Unit(-20, '1/degC'),
  ti: new Unit(2, 'hour'),
  td: new Unit(10, 'min'),
};

const beerHeatConfig: Partial<PidData> = {
  kp: new Unit(100, '1/degC'),
  ti: new Unit(6, 'hour'),
  td: new Unit(30, 'min'),
};

const fridgeHeatConfig: Partial<PidData> = {
  kp: new Unit(20, '1/degC'),
  ti: new Unit(2, 'hour'),
  td: new Unit(10, 'min'),
};

export const defineChangedBlocks = (config: FermentConfig): Block[] => {
  return unlinkedActuators(config.serviceId, [config.heatPin, config.coolPin]);
};

export const defineCreatedBlocks = (config: FermentConfig, opts: FermentOpts): Block[] => {
  const groups = [0];
  const { serviceId, names } = config;
  const { fridgeSetting, beerSetting, activeSetpoint } = opts;
  const isBeer = activeSetpoint === 'beer';
  const activeSetpointId = isBeer ? names.beerSetpoint : names.fridgeSetpoint;
  const initialSetting = isBeer ? beerSetting : fridgeSetting;

  const coolPidConfig: Partial<PidData> = isBeer
    ? beerCoolConfig
    : fridgeCoolConfig;

  const heatPidConfig: Partial<PidData> = isBeer
    ? beerHeatConfig
    : fridgeHeatConfig;

  const blocks: [
    SetpointSensorPairBlock,
    SetpointSensorPairBlock,
    MutexBlock,
    DigitalActuatorBlock,
    DigitalActuatorBlock,
    ActuatorPwmBlock,
    ActuatorPwmBlock,
    SetpointProfileBlock,
    PidBlock,
    PidBlock
  ] = [
      // setpoint sensor pair
      {
        id: names.fridgeSetpoint,
        type: 'SetpointSensorPair',
        serviceId,
        groups,
        data: {
          sensorId: new Link(names.fridgeSensor),
          storedSetting: fridgeSetting,
          settingEnabled: activeSetpoint === 'fridge',
          setting: new Unit(null, 'degC'),
          value: new Unit(null, 'degC'),
          valueUnfiltered: new Unit(null, 'degC'),
          filter: FilterChoice.Filter15s,
          filterThreshold: new Unit(5, 'delta_degC'),
          resetFilter: false,
        },
      },
      {
        id: names.beerSetpoint,
        type: 'SetpointSensorPair',
        serviceId,
        groups,
        data: {
          sensorId: new Link(names.beerSensor),
          storedSetting: beerSetting,
          settingEnabled: activeSetpoint === 'beer',
          setting: new Unit(null, 'degC'),
          value: new Unit(null, 'degC'),
          valueUnfiltered: new Unit(null, 'degC'),
          filter: FilterChoice.Filter15s,
          filterThreshold: new Unit(5, 'delta_degC'),
          resetFilter: false,
        },
      },
      // Mutex
      {
        id: names.mutex,
        type: 'Mutex',
        serviceId,
        groups,
        data: {
          differentActuatorWait: new Time(),
          waitRemaining: new Time(),
        },
      },
      // Digital Actuator
      {
        id: names.coolAct,
        type: 'DigitalActuator',
        serviceId,
        groups,
        data: {
          hwDevice: new Link(config.coolPin.arrayId),
          channel: config.coolPin.pinId,
          invert: false,
          desiredState: DigitalState.Inactive,
          state: DigitalState.Inactive,
          constrainedBy: {
            constraints: [
              {
                minOff: new Time(5, 'min'),
                remaining: new Time(),
              },
              {
                minOn: new Time(2, 'min'),
                remaining: new Time(),
              },
              {
                mutexed: {
                  mutexId: new Link(names.mutex, 'Mutex'),
                  extraHoldTime: new Time(45, 'min'),
                  hasCustomHoldTime: true,
                  hasLock: false,
                },
                remaining: new Time(),
              },
            ],
          },
        },
      },
      {
        id: names.heatAct,
        type: 'DigitalActuator',
        serviceId,
        groups,
        data: {
          hwDevice: new Link(config.heatPin.arrayId),
          channel: config.heatPin.pinId,
          desiredState: DigitalState.Inactive,
          state: DigitalState.Inactive,
          invert: false,
          constrainedBy: {
            constraints: [
              {
                mutexed: {
                  mutexId: new Link(names.mutex, 'Mutex'),
                  extraHoldTime: new Time(20, 'min'),
                  hasCustomHoldTime: true,
                  hasLock: false,
                },
                remaining: new Time(),
              },
            ],
          },
        },
      },
      // PWM
      {
        id: names.coolPwm,
        type: 'ActuatorPwm',
        serviceId,
        groups,
        data: {
          enabled: true,
          period: new Time(30, 'min'),
          actuatorId: new Link(names.coolAct),
          drivenActuatorId: new Link(null),
          setting: 0,
          desiredSetting: 0,
          value: 0,
          constrainedBy: { constraints: [] },
        },
      },
      {
        id: names.heatPwm,
        type: 'ActuatorPwm',
        serviceId,
        groups,
        data: {
          enabled: true,
          period: new Time(10, 's'),
          actuatorId: new Link(names.heatAct),
          drivenActuatorId: new Link(null),
          setting: 0,
          desiredSetting: 0,
          value: 0,
          constrainedBy: { constraints: [] },
        },
      },
      // Setpoint Profile
      {
        id: names.tempProfile,
        type: 'SetpointProfile',
        serviceId,
        groups,
        data: {
          start: new Date().getTime() / 1000,
          enabled: false,
          targetId: new Link(activeSetpointId),
          drivenTargetId: new Link(null),
          points: [
            { time: 0, temperature: initialSetting },
            { time: durationMs('7d') / 1000, temperature: initialSetting },
            { time: durationMs('10d') / 1000, temperature: initialSetting.copy(initialSetting.value! + 3) },
          ],
        },
      },
      // PID
      {
        id: names.coolPid,
        type: 'Pid',
        serviceId,
        groups,
        data: {
          ...pidDefaults(),
          ...coolPidConfig,
          enabled: true,
          inputId: new Link(activeSetpointId),
          outputId: new Link(names.coolPwm),
        },
      },
      {
        id: names.heatPid,
        type: 'Pid',
        serviceId,
        groups,
        data: {
          ...pidDefaults(),
          ...heatPidConfig,
          enabled: true,
          inputId: new Link(activeSetpointId),
          outputId: new Link(names.heatPwm),
        },
      },
    ];
  return blocks;
};


export const defineWidgets = (
  config: FermentConfig,
  opts: FermentOpts,
  layouts: BuilderLayout[]
): Widget[] => {
  const genericSettings = {
    dashboard: config.dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const { serviceId, names, prefix } = config;
  const { Temp } = sparkStore.moduleById(serviceId)!.units;

  const createWidget = (name: string, type: string): Widget => ({
    ...genericSettings,
    ...featureStore.widgetSize(type),
    id: uid(),
    title: name,
    feature: type,
    order: 0,
    config: {
      blockId: name,
      serviceId,
    },
  });

  const createBuilder = (): Widget<BuilderConfig> => ({
    ...createWidget(withPrefix(prefix, 'Process'), 'Builder'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map(l => l.id),
    },
  });

  const createGraph = (): Widget<GraphConfig> => ({
    ...createWidget(withPrefix(prefix, 'Graph'), 'Graph'),
    cols: 6,
    rows: 5,
    pinnedPosition: { x: 5, y: 1 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: serviceId,
          fields: [
            `${names.fridgeSensor}/value[${Temp}]`,
            `${names.beerSensor}/value[${Temp}]`,
            `${names.fridgeSetpoint}/setting[${Temp}]`,
            `${names.beerSetpoint}/setting[${Temp}]`,
            `${names.coolPwm}/value`,
            `${names.heatPwm}/value`,
            `${names.coolAct}/state`,
            `${names.heatAct}/state`,
          ],
        },
      ],
      renames: {
        [`${serviceId}/${names.fridgeSensor}/value[${Temp}]`]: 'Fridge temperature',
        [`${serviceId}/${names.beerSensor}/value[${Temp}]`]: 'Beer temperature',
        [`${serviceId}/${names.fridgeSetpoint}/setting[${Temp}]`]: 'Fridge setting',
        [`${serviceId}/${names.beerSetpoint}/setting[${Temp}]`]: 'Beer setting',
        [`${serviceId}/${names.coolPwm}/value`]: 'Cool PWM value',
        [`${serviceId}/${names.heatPwm}/value`]: 'Heat PWM value',
        [`${serviceId}/${names.coolAct}/state`]: 'Cool Pin state',
        [`${serviceId}/${names.heatAct}/state`]: 'Heat Pin state',
      },
      axes: {
        [`${serviceId}/${names.coolPwm}/value`]: 'y2',
        [`${serviceId}/${names.heatPwm}/value`]: 'y2',
        [`${serviceId}/${names.heatAct}/state`]: 'y2',
        [`${serviceId}/${names.coolAct}/state`]: 'y2',
      },
      colors: {},
    },
  });

  const createQuickActions = (): Widget<QuickActionsConfig> => ({
    ...createWidget(withPrefix(prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 4,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      changeIdMigrated: true,
      serviceIdMigrated: true,
      serviceId,
      steps: serialize([
        {
          name: 'Enable control',
          id: uid(),
          changes: [
            {
              id: uid(),
              serviceId,
              blockId: names.beerSetpoint,
              data: { settingEnabled: true },
            },
            {
              id: uid(),
              serviceId,
              blockId: names.fridgeSetpoint,
              data: { settingEnabled: true },
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
        {
          name: 'Disable control',
          id: uid(),
          changes: [
            {
              id: uid(),
              serviceId,
              blockId: names.tempProfile,
              data: { enabled: false },
            },
            {
              id: uid(),
              serviceId,
              blockId: names.beerSetpoint,
              data: { settingEnabled: false },
            },
            {
              id: uid(),
              serviceId,
              blockId: names.fridgeSetpoint,
              data: { settingEnabled: false },
            },
          ] as [
              BlockChange<SetpointProfileBlock>,
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
        {
          name: 'Constant fridge temperature',
          id: uid(),
          changes: [
            {
              id: uid(),
              serviceId,
              blockId: names.fridgeSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: opts.fridgeSetting,
              },
              confirmed: { storedSetting: true },
            },
            {
              id: uid(),
              serviceId,
              blockId: names.beerSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              serviceId,
              blockId: names.coolPid,
              data: {
                inputId: new Link(names.fridgeSetpoint, 'ProcessValueInterface'),
                ...fridgeCoolConfig,
              },
              confirmed: {},
            },
            {
              id: uid(),
              serviceId,
              blockId: names.heatPid,
              data: {
                inputId: new Link(names.fridgeSetpoint, 'ProcessValueInterface'),
                ...fridgeHeatConfig,
              },
              confirmed: {},
            },
            {
              id: uid(),
              serviceId,
              blockId: names.tempProfile,
              data: { targetId: new Link(names.fridgeSetpoint) },
              confirmed: {},
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<PidBlock>,
              BlockChange<PidBlock>,
              BlockChange<SetpointProfileBlock>,
            ],
        },
        {
          name: 'Constant beer temperature',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.fridgeSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: names.beerSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: opts.beerSetting,
              },
              confirmed: { storedSetting: true },
            },
            {
              id: uid(),
              blockId: names.coolPid,
              data: {
                inputId: new Link(names.beerSetpoint, 'ProcessValueInterface'),
                ...beerCoolConfig,
              },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: names.heatPid,
              data: {
                inputId: new Link(names.beerSetpoint, 'ProcessValueInterface'),
                ...beerHeatConfig,
              },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: names.tempProfile,
              data: { targetId: new Link(names.beerSetpoint) },
              confirmed: {},
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<PidBlock>,
              BlockChange<PidBlock>,
              BlockChange<SetpointProfileBlock>,
            ],
        },
        {
          name: 'Start profile',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.tempProfile,
              data: { enabled: true, start: 0 },
              confirmed: { start: true },
            },
          ] as [
              BlockChange<SetpointProfileBlock>,
            ],
        },
        {
          name: 'Disable profile',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.tempProfile,
              data: { enabled: false },
            },
          ] as [
              BlockChange<SetpointProfileBlock>,
            ],
        },
      ]),
    },
  });

  const createProfile = (name: string): Widget => ({
    ...createWidget(name, blockTypes.SetpointProfile),
    cols: 6,
    rows: 4,
    pinnedPosition: { x: 5, y: 6 },
  });

  return [createBuilder(), createGraph(), createQuickActions(), createProfile(names.tempProfile)];
};

export const defineDisplayedBlocks = (config: FermentConfig): DisplayBlock[] => {
  const { coolPid, heatPid } = config.names;
  return [
    {
      blockId: coolPid,
      opts: {
        showDialog: false,
        color: '037cd5',
        name: withoutPrefix(config.prefix, coolPid),
      },
    },
    {
      blockId: heatPid,
      opts: {
        showDialog: false,
        color: 'df2b35',
        name: withoutPrefix(config.prefix, heatPid),
      },
    },
  ];
};
