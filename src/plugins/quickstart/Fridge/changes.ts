import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import { useFeatureStore } from '@/store/features';
import { Widget } from '@/store/widgets';
import { userUnits } from '@/user-settings';
import { bloxLink } from '@/utils/link';
import { typed } from '@/utils/misc';
import { bloxQty, deltaTempQty, tempQty } from '@/utils/quantity';
import {
  ActuatorPwmBlock,
  Block,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  FilterChoice,
  MutexBlock,
  PidBlock,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { nanoid } from 'nanoid';
import { TempControlWidget } from '../TempControl/types';
import { DisplayBlock, QuickstartPatch } from '../types';
import {
  changedIoModules,
  makeFridgeCoolConfig,
  makeFridgeHeatConfig,
  pidDefaults,
  unlinkedActuators,
  withoutPrefix,
  withPrefix,
} from '../utils';
import { FridgeConfig } from './types';

export function defineChangedBlocks(
  config: FridgeConfig,
): QuickstartPatch<Block>[] {
  const channels = [config.heatChannel, config.coolChannel];
  return [
    ...unlinkedActuators(config.serviceId, channels),
    ...changedIoModules(config.serviceId, config.changedGpio),
  ];
}

export function defineCreatedBlocks(config: FridgeConfig): Block[] {
  const { serviceId, names } = config;
  const { fridgeSetting } = config.fridgeOpts;

  return [
    // setpoint sensor pair
    typed<SetpointSensorPairBlock>({
      id: names.fridgeSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
      data: {
        sensorId: bloxLink(names.fridgeSensor),
        storedSetting: fridgeSetting,
        enabled: true,
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        filterThreshold: deltaTempQty(5),
        filter: FilterChoice.FILTER_15s,
        resetFilter: false,
        claimedBy: bloxLink(null),
      },
    }),
    // Mutex
    typed<MutexBlock>({
      id: names.mutex,
      type: BlockType.Mutex,
      serviceId,
      data: {
        differentActuatorWait: bloxQty('0s'),
        waitRemaining: bloxQty('0s'),
      },
    }),
    // Digital Actuator
    typed<DigitalActuatorBlock>({
      id: names.coolAct,
      type: BlockType.DigitalActuator,
      serviceId,
      data: {
        hwDevice: bloxLink(config.coolChannel.blockId),
        channel: config.coolChannel.channelId,
        invert: false,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        transitionDurationPreset: TransitionDurationPreset.ST_OFF,
        transitionDurationSetting: bloxQty('0s'),
        transitionDurationValue: bloxQty('0s'),
        claimedBy: bloxLink(null),
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
    }),
    typed<DigitalActuatorBlock>({
      id: names.heatAct,
      type: BlockType.DigitalActuator,
      serviceId,
      data: {
        hwDevice: bloxLink(config.heatChannel.blockId),
        channel: config.heatChannel.channelId,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        invert: false,
        transitionDurationPreset: TransitionDurationPreset.ST_OFF,
        transitionDurationSetting: bloxQty('0s'),
        transitionDurationValue: bloxQty('0s'),
        claimedBy: bloxLink(null),
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
    }),
    // PWM
    typed<ActuatorPwmBlock>({
      id: names.coolPwm,
      type: BlockType.ActuatorPwm,
      serviceId,
      data: {
        enabled: true,
        period: bloxQty('30m'),
        actuatorId: bloxLink(names.coolAct),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
        claimedBy: bloxLink(null),
      },
    }),
    typed<ActuatorPwmBlock>({
      id: names.heatPwm,
      type: BlockType.ActuatorPwm,
      serviceId,
      data: {
        enabled: true,
        period: bloxQty('10s'),
        actuatorId: bloxLink(names.heatAct),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
        claimedBy: bloxLink(null),
      },
    }),
    // Setpoint Profile
    typed<SetpointProfileBlock>({
      id: names.tempProfile,
      type: BlockType.SetpointProfile,
      serviceId,
      data: {
        start: new Date().toISOString(),
        enabled: false,
        targetId: bloxLink(names.fridgeSetpoint),
        points: [
          {
            time: bloxQty('0s'),
            temperature: fridgeSetting,
          },
          {
            time: bloxQty('7d'),
            temperature: fridgeSetting,
          },
          {
            time: bloxQty('10d'),
            temperature: bloxQty(fridgeSetting).copy(fridgeSetting.value! + 3),
          },
        ],
      },
    }),
    // PID
    typed<PidBlock>({
      id: names.coolPid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        ...makeFridgeCoolConfig(),
        enabled: true,
        inputId: bloxLink(names.fridgeSetpoint),
        outputId: bloxLink(names.coolPwm),
      },
    }),
    typed<PidBlock>({
      id: names.heatPid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        ...makeFridgeHeatConfig(),
        enabled: true,
        inputId: bloxLink(names.fridgeSetpoint),
        outputId: bloxLink(names.heatPwm),
      },
    }),
  ];
}

export const defineWidgets = (
  config: FridgeConfig,
  layouts: BuilderLayout[],
): Widget[] => {
  const featureStore = useFeatureStore();
  const genericSettings = {
    dashboard: config.dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const { serviceId, names, prefix } = config;
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
        `${serviceId}/${names.fridgeSetpoint}/setting[${tempUnit}]`,
        `${serviceId}/${names.coolPwm}/value`,
        `${serviceId}/${names.heatPwm}/value`,
        `${serviceId}/${names.coolAct}/state`,
        `${serviceId}/${names.heatAct}/state`,
      ],
      renames: {
        [`${serviceId}/${names.fridgeSensor}/value[${tempUnit}]`]:
          'Fridge temperature',
        [`${serviceId}/${names.fridgeSetpoint}/setting[${tempUnit}]`]:
          'Fridge setting',
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
