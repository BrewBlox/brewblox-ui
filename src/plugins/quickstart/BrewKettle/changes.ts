import { nanoid } from 'nanoid';

import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import {
  ActuatorPwmBlock,
  Block,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  FilterChoice,
  PidBlock,
  SetpointSensorPairBlock,
} from '@/plugins/spark/types';
import { useFeatureStore } from '@/store/features';
import { Widget } from '@/store/widgets';
import { userUnits } from '@/user-settings';
import { bloxLink } from '@/utils/link';
import { bloxQty, deltaTempQty, tempQty } from '@/utils/quantity';

import { TempControlWidget } from '../TempControl/types';
import { DisplayBlock, QuickstartPatch } from '../types';
import {
  changedIoModules,
  pidDefaults,
  unlinkedActuators,
  withPrefix,
  withoutPrefix,
} from '../utils';
import { BrewKettleConfig } from './types';

export function defineChangedBlocks(
  config: BrewKettleConfig,
): QuickstartPatch<Block>[] {
  return [
    ...unlinkedActuators(config.serviceId, [config.kettleChannel]),
    ...changedIoModules(config.serviceId, config.changedGpio),
  ];
}

export function defineCreatedBlocks(config: BrewKettleConfig): Block[] {
  const { serviceId, names } = config;

  const blocks: [
    SetpointSensorPairBlock,
    DigitalActuatorBlock,
    ActuatorPwmBlock,
    PidBlock,
  ] = [
    {
      id: names.kettleSetpoint,
      type: BlockType.SetpointSensorPair,
      serviceId,
      data: {
        sensorId: bloxLink(names.kettleSensor),
        storedSetting: tempQty(70),
        settingEnabled: false,
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        filterThreshold: deltaTempQty(5),
        filter: FilterChoice.FILTER_15s,
        resetFilter: false,
      },
    },
    {
      id: names.kettleAct,
      type: BlockType.DigitalActuator,
      serviceId,
      data: {
        hwDevice: bloxLink(config.kettleChannel.blockId),
        channel: config.kettleChannel.channelId,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        invert: false,
        constrainedBy: {
          constraints: [],
        },
      },
    },
    {
      id: names.kettlePwm,
      type: BlockType.ActuatorPwm,
      serviceId,
      data: {
        enabled: true,
        period: bloxQty('2s'),
        actuatorId: bloxLink(names.kettleAct),
        drivenActuatorId: bloxLink(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: {
          constraints: [],
        },
      },
    },
    {
      id: names.kettlePid,
      type: BlockType.Pid,
      serviceId,
      data: {
        ...pidDefaults(),
        enabled: true,
        inputId: bloxLink(names.kettleSetpoint),
        outputId: bloxLink(names.kettlePwm),
        kp: config.kettleOpts.kp,
        ti: bloxQty('10m'),
        td: bloxQty('10s'),
        boilMinOutput: 25,
      },
    },
  ];

  return blocks;
}

export function defineWidgets(
  config: BrewKettleConfig,
  layouts: BuilderLayout[],
): Widget[] {
  const featureStore = useFeatureStore();
  const { serviceId, names, dashboardId, prefix } = config;
  const userTemp = userUnits.value.temperature;
  const genericSettings = {
    dashboard: dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const createWidget = (name: string, type: string): Widget => ({
    ...genericSettings,
    ...featureStore.widgetSize(type),
    id: nanoid(),
    title: name,
    feature: type,
    order: 0,
    config: {
      blockId: name,
      serviceId: serviceId,
    },
  });

  const createBuilder = (): Widget<BuilderConfig> => ({
    ...createWidget(withPrefix(prefix, 'Process'), 'Builder'),
    cols: 11,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map((l) => l.id),
    },
  });

  const createGraph = (): Widget<GraphConfig> => ({
    ...createWidget(withPrefix(prefix, 'Graph'), 'Graph'),
    cols: 7,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      version: '1.0',
      layout: {},
      params: { duration: '10m' },
      fields: [
        `${serviceId}/${names.kettleSensor}/value[${userTemp}]`,
        `${serviceId}/${names.kettleSetpoint}/setting[${userTemp}]`,
        `${serviceId}/${names.kettlePwm}/value`,
      ],
      renames: {
        [`${serviceId}/${names.kettleSensor}/value[${userTemp}]`]:
          'Temperature',
        [`${serviceId}/${names.kettleSetpoint}/setting[${userTemp}]`]:
          'Setting',
        [`${serviceId}/${names.kettlePwm}/value`]: 'PWM value',
      },
      axes: {
        [`${serviceId}/${names.kettlePwm}/value`]: 'y2',
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
      rows: 5,
      pinnedPosition: { x: 8, y: 6 },
      config: {
        serviceId,
        coolPid: bloxLink(null, BlockType.Pid),
        heatPid: bloxLink(names.kettlePid, BlockType.Pid),
        profile: bloxLink(null, BlockType.SetpointProfile),
        activeMode: modeId,
        modes: [
          {
            id: modeId,
            title: 'Kettle',
            setpoint: bloxLink(
              names.kettleSetpoint,
              BlockType.SetpointSensorPair,
            ),
            coolConfig: null,
            heatConfig: {
              kp: config.kettleOpts.kp,
              ti: bloxQty('10m'),
              td: bloxQty('10s'),
            },
          },
        ],
      },
    };
  };

  return [createBuilder(), createGraph(), createTempControl()];
}

export const defineDisplayedBlocks = (
  config: BrewKettleConfig,
): DisplayBlock[] => {
  const { kettlePid } = config.names;
  return [
    {
      blockId: kettlePid,
      opts: {
        showDialog: false,
        color: 'c48600',
        name: withoutPrefix(config.prefix, kettlePid),
      },
    },
  ];
};
