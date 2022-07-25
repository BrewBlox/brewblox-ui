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
} from 'brewblox-proto/ts';
import { nanoid } from 'nanoid';
import { TempControlWidget } from '../TempControl/types';
import { DisplayBlock, PidConfig, QuickstartPatch } from '../types';
import {
  changedIoModules,
  makeBeerCoolConfig,
  makeBeerHeatConfig,
  makeFridgeCoolConfig,
  makeFridgeHeatConfig,
  pidDefaults,
  unlinkedActuators,
  withoutPrefix,
  withPrefix,
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

  return [
    // setpoint sensor pair
    typed<SetpointSensorPairBlock>({
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
    }),
    typed<SetpointSensorPairBlock>({
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
        drivenActuatorId: bloxLink(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
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
        drivenActuatorId: bloxLink(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
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
        targetId: bloxLink(activeSetpointId),
        drivenTargetId: bloxLink(null),
        points: [
          {
            time: bloxQty('0s'),
            temperature: initialSetting,
          },
          {
            time: bloxQty('7d'),
            temperature: initialSetting,
          },
          {
            time: bloxQty('10d'),
            temperature: bloxQty(initialSetting).copy(
              initialSetting.value! + 3,
            ),
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
        ...coolPidConfig,
        enabled: true,
        inputId: bloxLink(activeSetpointId),
        outputId: bloxLink(names.coolPwm),
      },
    }),
    typed<PidBlock>({
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
    }),
  ];
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
