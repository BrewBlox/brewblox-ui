import { nanoid } from 'nanoid';

import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import {
  ActuatorPwmBlock,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  FilterChoice,
  MutexBlock,
  PidBlock,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from '@/plugins/spark/types';
import { Block } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';
import { systemStore } from '@/store/system';
import { Widget } from '@/store/widgets';
import { bloxLink } from '@/utils/link';
import { bloxQty, deltaTempQty, durationMs, tempQty } from '@/utils/quantity';

import { TempControlWidget } from '../TempControl/types';
import { DisplayBlock } from '../types';
import {
  makeFridgeCoolConfig,
  makeFridgeHeatConfig,
  pidDefaults,
  unlinkedActuators,
  withoutPrefix,
  withPrefix,
} from '../utils';
import { FridgeConfig, FridgeOpts } from './types';

export const defineChangedBlocks = (config: FridgeConfig): Block[] => {
  return unlinkedActuators(config.serviceId, [config.heatPin, config.coolPin]);
};

export const defineCreatedBlocks = (config: FridgeConfig, opts: FridgeOpts): Block[] => {
  const groups = [0];
  const { serviceId, names } = config;
  const { fridgeSetting } = opts;

  const blocks: [
    SetpointSensorPairBlock,
    MutexBlock,
    DigitalActuatorBlock,
    DigitalActuatorBlock,
    ActuatorPwmBlock,
    ActuatorPwmBlock,
    SetpointProfileBlock,
    PidBlock,
    PidBlock,
  ] = [
      // setpoint sensor pair
      {
        id: names.fridgeSetpoint,
        type: BlockType.SetpointSensorPair,
        serviceId,
        groups,
        data: {
          sensorId: bloxLink(names.fridgeSensor),
          storedSetting: fridgeSetting,
          settingEnabled: true,
          setting: tempQty(null),
          value: tempQty(null),
          valueUnfiltered: tempQty(null),
          filterThreshold: deltaTempQty(5),
          filter: FilterChoice.FILTER_15s,
          resetFilter: false,
        },
      },
      // Mutex
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
      // Digital Actuator
      {
        id: names.coolAct,
        type: BlockType.DigitalActuator,
        serviceId,
        groups,
        data: {
          hwDevice: bloxLink(config.coolPin.arrayId),
          channel: config.coolPin.pinId,
          invert: false,
          desiredState: DigitalState.STATE_INACTIVE,
          state: DigitalState.STATE_INACTIVE,
          constrainedBy: {
            constraints: [
              {
                minOff: bloxQty('5m'),
                remaining: bloxQty('0s'),
              },
              {
                minOn: bloxQty('2m'),
                remaining: bloxQty('0s'),
              },
              {
                mutexed: {
                  mutexId: bloxLink(names.mutex),
                  extraHoldTime: bloxQty('45m'),
                  hasCustomHoldTime: true,
                  hasLock: false,
                },
                remaining: bloxQty('0s'),
              },
            ],
          },
        },
      },
      {
        id: names.heatAct,
        type: BlockType.DigitalActuator,
        serviceId,
        groups,
        data: {
          hwDevice: bloxLink(config.heatPin.arrayId),
          channel: config.heatPin.pinId,
          desiredState: DigitalState.STATE_INACTIVE,
          state: DigitalState.STATE_INACTIVE,
          invert: false,
          constrainedBy: {
            constraints: [
              {
                mutexed: {
                  mutexId: bloxLink(names.mutex),
                  extraHoldTime: bloxQty('20m'),
                  hasCustomHoldTime: true,
                  hasLock: false,
                },
                remaining: bloxQty('0s'),
              },
            ],
          },
        },
      },
      // PWM
      {
        id: names.coolPwm,
        type: BlockType.ActuatorPwm,
        serviceId,
        groups,
        data: {
          enabled: true,
          period: bloxQty('30m'),
          actuatorId: bloxLink(names.coolAct),
          drivenActuatorId: bloxLink(null),
          setting: 0,
          desiredSetting: 0,
          value: 0,
          constrainedBy: { constraints: [] },
        },
      },
      {
        id: names.heatPwm,
        type: BlockType.ActuatorPwm,
        serviceId,
        groups,
        data: {
          enabled: true,
          period: bloxQty('10s'),
          actuatorId: bloxLink(names.heatAct),
          drivenActuatorId: bloxLink(null),
          setting: 0,
          desiredSetting: 0,
          value: 0,
          constrainedBy: { constraints: [] },
        },
      },
      // Setpoint Profile
      {
        id: names.tempProfile,
        type: BlockType.SetpointProfile,
        serviceId,
        groups,
        data: {
          start: new Date().getTime() / 1000,
          enabled: false,
          targetId: bloxLink(names.fridgeSetpoint),
          drivenTargetId: bloxLink(null),
          points: [
            {
              time: 0,
              temperature: fridgeSetting,
            },
            {
              time: durationMs('7d') / 1000,
              temperature: fridgeSetting,
            },
            {
              time: durationMs('10d') / 1000,
              temperature: bloxQty(fridgeSetting).copy(fridgeSetting.value! + 3),
            },
          ],
        },
      },
      // PID
      {
        id: names.coolPid,
        type: BlockType.Pid,
        serviceId,
        groups,
        data: {
          ...pidDefaults(),
          ...makeFridgeCoolConfig(),
          enabled: true,
          inputId: bloxLink(names.fridgeSetpoint),
          outputId: bloxLink(names.coolPwm),
        },
      },
      {
        id: names.heatPid,
        type: BlockType.Pid,
        serviceId,
        groups,
        data: {
          ...pidDefaults(),
          ...makeFridgeHeatConfig(),
          enabled: true,
          inputId: bloxLink(names.fridgeSetpoint),
          outputId: bloxLink(names.heatPwm),
        },
      },
    ];
  return blocks;
};


export const defineWidgets = (
  config: FridgeConfig,
  opts: FridgeOpts,
  layouts: BuilderLayout[],
): Widget[] => {
  const genericSettings = {
    dashboard: config.dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const { serviceId, names, prefix } = config;
  const tempUnit = systemStore.units.temperature;

  const createWidget = (name: string, type: string): Widget => ({
    ...genericSettings,
    ...featureStore.widgetSize(type),
    id: nanoid(),
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
            `${names.fridgeSensor}/value[${tempUnit}]`,
            `${names.fridgeSetpoint}/setting[${tempUnit}]`,
            `${names.coolPwm}/value`,
            `${names.heatPwm}/value`,
            `${names.coolAct}/state`,
            `${names.heatAct}/state`,
          ],
        },
      ],
      renames: {
        [`${serviceId}/${names.fridgeSensor}/value[${tempUnit}]`]: 'Fridge temperature',
        [`${serviceId}/${names.fridgeSetpoint}/setting[${tempUnit}]`]: 'Fridge setting',
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
      precision: {},
    },
  });

  const createTempControl = (): TempControlWidget => {
    const modeId = nanoid();

    return {
      ...createWidget(withPrefix(prefix, 'Assistant'), 'TempControl'),
      cols: 4,
      rows: 4,
      pinnedPosition: { x: 1, y: 6 },
      config: {
        serviceId,
        coolPid: bloxLink(names.coolPid, BlockType.Pid),
        heatPid: bloxLink(names.heatPid, BlockType.Pid),
        profile: bloxLink(names.tempProfile, BlockType.SetpointProfile),
        activeMode: modeId,
        modes: [
          {
            id: modeId,
            title: 'Fridge',
            setpoint: bloxLink(names.fridgeSetpoint, BlockType.SetpointSensorPair),
            coolConfig: makeFridgeCoolConfig(),
            heatConfig: makeFridgeHeatConfig(),
          },
        ],
      },
    };
  };

  const createProfile = (name: string): Widget => ({
    ...createWidget(name, BlockType.SetpointProfile),
    cols: 6,
    rows: 4,
    pinnedPosition: { x: 5, y: 6 },
  });

  return [
    createBuilder(),
    createGraph(),
    createTempControl(),
    createProfile(names.tempProfile),
  ];
};

export const defineDisplayedBlocks = (config: FridgeConfig): DisplayBlock[] => {
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
