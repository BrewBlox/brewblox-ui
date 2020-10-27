import { uid } from 'quasar';

import { bloxLink, bloxQty } from '@/helpers/bloxfield';
import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import { BlockChange, QuickActionsConfig } from '@/plugins/spark/features/QuickActions/types';
import { sparkStore } from '@/plugins/spark/store';
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
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { pidDefaults, unlinkedActuators, withoutPrefix, withPrefix } from '../helpers';
import { DisplayBlock } from '../types';
import { BrewKettleConfig, BrewKettleOpts } from './types';

export function defineChangedBlocks(config: BrewKettleConfig): Block[] {
  return unlinkedActuators(config.serviceId, [config.kettlePin]);
};

export function defineCreatedBlocks(config: BrewKettleConfig, opts: BrewKettleOpts): Block[] {
  const groups = [0];
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
        groups,
        data: {
          sensorId: bloxLink(names.kettleSensor),
          storedSetting: bloxQty(70, 'degC'),
          settingEnabled: false,
          setting: bloxQty(null, 'degC'),
          value: bloxQty(null, 'degC'),
          valueUnfiltered: bloxQty(null, 'degC'),
          filter: FilterChoice.FILTER_15s,
          filterThreshold: bloxQty(5, 'delta_degC'),
          resetFilter: false,
        },
      },
      {
        id: names.kettleAct,
        type: BlockType.DigitalActuator,
        serviceId,
        groups,
        data: {
          hwDevice: bloxLink(config.kettlePin.arrayId),
          channel: config.kettlePin.pinId,
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
        groups,
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
        groups,
        data: {
          ...pidDefaults(serviceId),
          enabled: true,
          inputId: bloxLink(names.kettleSetpoint),
          outputId: bloxLink(names.kettlePwm),
          kp: opts.kp,
          ti: bloxQty('5m'),
          td: bloxQty('10m'),
          boilMinOutput: 25,
        },
      },
    ];

  return blocks;
}


export function defineWidgets(config: BrewKettleConfig, layouts: BuilderLayout[]): Widget[] {
  const { serviceId, names, dashboardId, prefix } = config;
  const userTemp = sparkStore.moduleById(serviceId)!.units.Temp;
  const genericSettings = {
    dashboard: dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const createWidget = (name: string, type: string): Widget => ({
    ...genericSettings,
    ...featureStore.widgetSize(type),
    id: uid(),
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
      layoutIds: layouts.map(l => l.id),
    },
  });

  const createGraph = (): Widget<GraphConfig> => ({
    ...createWidget(withPrefix(prefix, 'Graph'), 'Graph'),
    cols: 7,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: serviceId,
          fields: [
            `${names.kettleSensor}/value[${userTemp}]`,
            `${names.kettleSetpoint}/setting[${userTemp}]`,
            `${names.kettlePwm}/value`,
          ],
        },
      ],
      renames: {
        [`${serviceId}/${names.kettleSensor}/value[${userTemp}]`]: 'Temperature',
        [`${serviceId}/${names.kettleSetpoint}/setting[${userTemp}]`]: 'Setting',
        [`${serviceId}/${names.kettlePwm}/value`]: 'PWM value',
      },
      axes: {
        [`${serviceId}/${names.kettlePwm}/value`]: 'y2',
      },
      colors: {},
      precision: {},
    },
  });

  const createQuickActions = (): Widget<QuickActionsConfig> => ({
    ...createWidget(withPrefix(prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 8, y: 6 },
    config: {
      serviceId,
      changeIdMigrated: true,
      serviceIdMigrated: true,
      actions: [
        {
          name: 'Disable Setpoint',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.kettleSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
        {
          name: 'Constant Kettle Temp',
          id: uid(),
          changes: [
            {
              id: uid(),
              serviceId,
              blockId: names.kettleSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: bloxQty(100, 'degC').to(userTemp),
              },
              confirmed: {
                storedSetting: true,
              },
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
      ],
    },
  });

  return [createBuilder(), createGraph(), createQuickActions()];
}

export const defineDisplayedBlocks = (config: BrewKettleConfig): DisplayBlock[] => {
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
