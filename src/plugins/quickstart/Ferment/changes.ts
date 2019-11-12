import { uid } from 'quasar';

import { durationMs } from '@/helpers/functional';
import { Link, Unit } from '@/helpers/units';
import { serialize } from '@/helpers/units/parseObject';
import { BuilderItem, BuilderLayout } from '@/plugins/builder/types';
import { HistoryItem } from '@/plugins/history/Graph/types';
import {
  ActuatorPwmBlock,
  blockTypes,
  DigitalActuatorBlock,
  FilterChoice,
  interfaceTypes,
  MutexBlock,
  PidBlock,
  PidData,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from '@/plugins/spark/block-types';
import { QuickActionsItem } from '@/plugins/spark/features/QuickActions/types';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState } from '@/plugins/spark/types';
import { PersistentWidget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { maybeSpace, unlinkedActuators } from '../helpers';
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
  const serviceId = config.serviceId;
  const { fridgeSetting, beerSetting, activeSetpoint } = opts;
  const isBeer = activeSetpoint === 'beer';
  const activeSetpointId = isBeer ? config.names.beerSetpoint : config.names.fridgeSetpoint;
  const initialSetting = isBeer ? beerSetting : fridgeSetting;

  const coolPidConfig: Partial<PidData> = isBeer
    ? beerCoolConfig
    : fridgeCoolConfig;

  const heatPidConfig: Partial<PidData> = isBeer
    ? beerHeatConfig
    : fridgeHeatConfig;

  return [
    // setpoint sensor pair
    {
      id: config.names.fridgeSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.fridgeSensor),
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
      id: config.names.beerSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.beerSensor),
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
      id: config.names.mutex,
      type: blockTypes.Mutex,
      serviceId,
      groups,
      data: {
        differentActuatorWait: new Unit(45, 'minute'),
      },
    },
    // Digital Actuator
    {
      id: config.names.coolAct,
      type: blockTypes.DigitalActuator,
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
            { minOff: new Unit(300, 'second'), limiting: false },
            { minOn: new Unit(180, 'second'), limiting: false },
            { mutex: new Link(config.names.mutex), limiting: false },
          ],
        },
      },
    },
    {
      id: config.names.heatAct,
      type: blockTypes.DigitalActuator,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.heatPin.arrayId),
        channel: config.heatPin.pinId,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        invert: false,
        constrainedBy: {
          constraints: [{ mutex: new Link(config.names.mutex), limiting: false }],
        },
      },
    },
    // PWM
    {
      id: config.names.coolPwm,
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(30, 'minute'),
        actuatorId: new Link(config.names.coolAct),
        drivenActuatorId: new Link(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
      },
    },
    {
      id: config.names.heatPwm,
      type: blockTypes.ActuatorPwm,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(10, 'second'),
        actuatorId: new Link(config.names.heatAct),
        drivenActuatorId: new Link(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
      },
    },
    // Setpoint Profile
    {
      id: config.names.tempProfile,
      type: blockTypes.SetpointProfile,
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
      id: config.names.coolPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        ...coolPidConfig,
        enabled: true,
        inputId: new Link(activeSetpointId),
        outputId: new Link(config.names.coolPwm),
      },
    },
    {
      id: config.names.heatPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        ...heatPidConfig,
        enabled: true,
        inputId: new Link(activeSetpointId),
        outputId: new Link(config.names.heatPwm),
      },
    },
  ] as [
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
    ];
};


export const defineWidgets = (
  config: FermentConfig,
  opts: FermentOpts,
  layouts: BuilderLayout[]
): PersistentWidget[] => {
  const genericSettings = {
    dashboard: config.dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const userTemp = sparkStore.units(config.serviceId).Temp;
  const serviceId = config.serviceId;

  const createWidget = (name: string, type: string): PersistentWidget => ({
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

  const createBuilder = (): BuilderItem => ({
    ...createWidget(maybeSpace(config.prefix, 'Process'), 'Builder'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map(l => l.id),
    },
  });

  const createGraph = (): HistoryItem => ({
    ...createWidget(maybeSpace(config.prefix, 'Graph'), 'Graph'),
    cols: 6,
    rows: 5,
    pinnedPosition: { x: 5, y: 1 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: config.serviceId,
          fields: [
            `${config.names.fridgeSensor}/value[${userTemp}]`,
            `${config.names.beerSensor}/value[${userTemp}]`,
            `${config.names.fridgeSetpoint}/setting[${userTemp}]`,
            `${config.names.beerSetpoint}/setting[${userTemp}]`,
            `${config.names.coolPwm}/value`,
            `${config.names.heatPwm}/value`,
            `${config.names.coolAct}/state`,
            `${config.names.heatAct}/state`,
          ],
        },
      ],
      renames: {
        [`${config.serviceId}/${config.names.fridgeSensor}/value[${userTemp}]`]: 'Fridge temperature',
        [`${config.serviceId}/${config.names.beerSensor}/value[${userTemp}]`]: 'Beer temperature',
        [`${config.serviceId}/${config.names.fridgeSetpoint}/setting[${userTemp}]`]: 'Fridge setting',
        [`${config.serviceId}/${config.names.beerSetpoint}/setting[${userTemp}]`]: 'Beer setting',
        [`${config.serviceId}/${config.names.coolPwm}/value`]: 'Cool PWM value',
        [`${config.serviceId}/${config.names.heatPwm}/value`]: 'Heat PWM value',
        [`${config.serviceId}/${config.names.coolAct}/state`]: 'Cool Pin state',
        [`${config.serviceId}/${config.names.heatAct}/state`]: 'Heat Pin state',
      },
      axes: {
        [`${config.serviceId}/${config.names.coolPwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.heatPwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.heatAct}/state`]: 'y2',
        [`${config.serviceId}/${config.names.coolAct}/state`]: 'y2',
      },
      colors: {},
    },
  });

  const createQuickActions = (): QuickActionsItem => ({
    ...createWidget(maybeSpace(config.prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 4,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      serviceId,
      steps: serialize([
        {
          name: 'Enable control',
          id: uid(),
          changes: [
            {
              blockId: config.names.beerSetpoint,
              data: { settingEnabled: true },
            },
            {
              blockId: config.names.fridgeSetpoint,
              data: { settingEnabled: true },
            },
          ],
        },
        {
          name: 'Disable control',
          id: uid(),
          changes: [
            {
              blockId: config.names.tempProfile,
              data: { enabled: false },
            },
            {
              blockId: config.names.beerSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.fridgeSetpoint,
              data: { settingEnabled: false },
            },
          ],
        },
        {
          name: 'Constant fridge temperature',
          id: uid(),
          changes: [
            {
              blockId: config.names.fridgeSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: opts.fridgeSetting,
              },
              confirmed: { storedSetting: true },
            },
            {
              blockId: config.names.beerSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.coolPid,
              data: {
                inputId: new Link(config.names.fridgeSetpoint, interfaceTypes.ProcessValue),
                ...fridgeCoolConfig,
              },
            },
            {
              blockId: config.names.heatPid,
              data: {
                inputId: new Link(config.names.fridgeSetpoint, interfaceTypes.ProcessValue),
                ...fridgeHeatConfig,
              },
            },
            {
              blockId: config.names.tempProfile,
              data: { targetId: new Link(config.names.fridgeSetpoint) },
            },
          ],
        },
        {
          name: 'Constant beer temperature',
          id: uid(),
          changes: [
            {
              blockId: config.names.fridgeSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.beerSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: opts.beerSetting,
              },
              confirmed: { storedSetting: true },
            },
            {
              blockId: config.names.coolPid,
              data: {
                inputId: new Link(config.names.beerSetpoint, interfaceTypes.ProcessValue),
                ...beerCoolConfig,
              },
            },
            {
              blockId: config.names.heatPid,
              data: {
                inputId: new Link(config.names.beerSetpoint, interfaceTypes.ProcessValue),
                ...beerHeatConfig,
              },
            },
            {
              blockId: config.names.tempProfile,
              data: { targetId: new Link(config.names.beerSetpoint) },
            },
          ],
        },
        {
          name: 'Start profile',
          id: uid(),
          changes: [
            {
              blockId: config.names.tempProfile,
              data: { enabled: true, start: 0 },
              confirmed: { start: true },
            },
          ],
        },
        {
          name: 'Disable profile',
          id: uid(),
          changes: [
            {
              blockId: config.names.tempProfile,
              data: { enabled: false },
            },
          ],
        },
      ]),
    },
  });

  const createProfile = (name: string): PersistentWidget => ({
    ...createWidget(name, blockTypes.SetpointProfile),
    cols: 6,
    rows: 4,
    pinnedPosition: { x: 5, y: 6 },
  });

  return [createBuilder(), createGraph(), createQuickActions(), createProfile(config.names.tempProfile)];
};
