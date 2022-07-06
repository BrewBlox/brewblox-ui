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
import { useFeatureStore } from '@/store/features';
import { Widget } from '@/store/widgets';
import { userUnits } from '@/user-settings';
import { bloxLink } from '@/utils/link';
import { bloxQty, deltaTempQty, durationMs, tempQty } from '@/utils/quantity';

import { TempControlWidget } from '../TempControl/types';
import { DisplayBlock, PidConfig, QuickstartPatch } from '../types';
import {
  changedIoModules,
  pidDefaults,
  unlinkedActuators,
  withPrefix,
  withoutPrefix,
} from '../utils';
import {
  makeBeerCoolConfig,
  makeBeerHeatConfig,
  makeFridgeCoolConfig,
  makeFridgeHeatConfig,
} from '../utils';
import { FermentConfig } from './types';

export function defineChangedBlocks(
  config: FermentConfig,
): QuickstartPatch<Block>[] {
  return [
    ...unlinkedActuators(config.serviceId, [
      config.heatChannel,
      config.coolChannel,
    ]),
    ...changedIoModules(config.serviceId, config.changedGpio),
  ];
}

export function defineCreatedBlocks(config: FermentConfig): Block[] {
  const { serviceId, names } = config;
  const { fridgeSetting, beerSetting, activeSetpoint } = config.fermentOpts;
  const isBeer = activeSetpoint === 'beer';
  const activeSetpointId = isBeer ? names.beerSetpoint : names.fridgeSetpoint;
  const initialSetting = isBeer ? beerSetting : fridgeSetting;

  const coolPidConfig: PidConfig = isBeer
    ? makeBeerCoolConfig()
    : makeFridgeCoolConfig();

  const heatPidConfig: PidConfig = isBeer
    ? makeBeerHeatConfig()
    : makeFridgeHeatConfig();

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
    PidBlock,
  ] = [
    // setpoint sensor pair
    {
      id: names.fridgeSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
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
    {
      id: names.beerSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
      data: {
        sensorId: bloxLink(names.beerSensor),
        storedSetting: beerSetting,
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
      data: {
        hwDevice: bloxLink(config.coolChannel.blockId),
        channel: config.coolChannel.channelId,
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
      data: {
        hwDevice: bloxLink(config.heatChannel.blockId),
        channel: config.heatChannel.channelId,
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
      data: {
        start: new Date().getTime() / 1000,
        enabled: false,
        targetId: bloxLink(activeSetpointId),
        drivenTargetId: bloxLink(null),
        points: [
          {
            time: 0,
            temperature: initialSetting,
          },
          {
            time: durationMs('7d') / 1000,
            temperature: initialSetting,
          },
          {
            time: durationMs('10d') / 1000,
            temperature: bloxQty(initialSetting).copy(
              initialSetting.value! + 3,
            ),
          },
        ],
      },
    },
    // PID
    {
      id: names.coolPid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        ...coolPidConfig,
        enabled: true,
        inputId: bloxLink(activeSetpointId),
        outputId: bloxLink(names.coolPwm),
      },
    },
    {
      id: names.heatPid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        ...heatPidConfig,
        enabled: true,
        inputId: bloxLink(activeSetpointId),
        outputId: bloxLink(names.heatPwm),
      },
    },
  ];
  return blocks;
}

export const defineWidgets = (
  config: FermentConfig,
  layouts: BuilderLayout[],
): Widget[] => {
  const featureStore = useFeatureStore();

  const genericSettings = {
    dashboard: config.dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const { serviceId, names, prefix, fermentOpts } = config;
  const tempUnit = userUnits.value.temperature;

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
      layoutIds: layouts.map((l) => l.id),
    },
  });

  const createGraph = (): Widget<GraphConfig> => ({
    ...createWidget(withPrefix(prefix, 'Graph'), 'Graph'),
    cols: 6,
    rows: 5,
    pinnedPosition: { x: 5, y: 1 },
    config: {
      version: '1.0',
      layout: {},
      params: { duration: '10m' },
      fields: [
        `${serviceId}/${names.fridgeSensor}/value[${tempUnit}]`,
        `${serviceId}/${names.beerSensor}/value[${tempUnit}]`,
        `${serviceId}/${names.fridgeSetpoint}/setting[${tempUnit}]`,
        `${serviceId}/${names.beerSetpoint}/setting[${tempUnit}]`,
        `${serviceId}/${names.coolPwm}/value`,
        `${serviceId}/${names.heatPwm}/value`,
        `${serviceId}/${names.coolAct}/state`,
        `${serviceId}/${names.heatAct}/state`,
      ],
      renames: {
        [`${serviceId}/${names.fridgeSensor}/value[${tempUnit}]`]:
          'Fridge temperature',
        [`${serviceId}/${names.beerSensor}/value[${tempUnit}]`]:
          'Beer temperature',
        [`${serviceId}/${names.fridgeSetpoint}/setting[${tempUnit}]`]:
          'Fridge setting',
        [`${serviceId}/${names.beerSetpoint}/setting[${tempUnit}]`]:
          'Beer setting',
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
    const beerModeId = nanoid();
    const fridgeModeId = nanoid();
    const activeMode =
      fermentOpts.activeSetpoint === 'beer' ? beerModeId : fridgeModeId;

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
        activeMode,
        modes: [
          {
            id: beerModeId,
            title: 'Beer',
            setpoint: bloxLink(
              names.beerSetpoint,
              BlockType.SetpointSensorPair,
            ),
            coolConfig: makeBeerCoolConfig(),
            heatConfig: makeBeerHeatConfig(),
          },
          {
            id: fridgeModeId,
            title: 'Fridge',
            setpoint: bloxLink(
              names.fridgeSetpoint,
              BlockType.SetpointSensorPair,
            ),
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

export const defineDisplayedBlocks = (
  config: FermentConfig,
): DisplayBlock[] => {
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
