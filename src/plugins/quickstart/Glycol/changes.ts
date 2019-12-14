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
  MutexBlock,
  PidBlock,
  PidData,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from '@/plugins/spark/block-types';
import { BlockChange, QuickActionsItem } from '@/plugins/spark/features/QuickActions/types';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState } from '@/plugins/spark/types';
import { PersistentWidget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { maybeSpace, unlinkedActuators } from '../helpers';
import { GlycolConfig, GlycolOpts } from './types';


export function defineChangedBlocks(config: GlycolConfig): Block[] {
  const pins = config.heated ? [config.heatPin!, config.coolPin] : [config.coolPin];
  return unlinkedActuators(config.serviceId, pins);
};

export function defineCreatedBlocks(config: GlycolConfig, opts: GlycolOpts): Block[] {
  const { serviceId } = config;
  const { beerSetting, glycolSetting } = opts;
  const groups = [0];

  const heatingBlocks = [
    config.names.heatPid,
    config.names.heatPwm,
    config.names.heatAct,
  ];

  const blocks = [
    // Setpoint
    {
      id: config.names.beerSetpoint,
      type: blockTypes.SetpointSensorPair,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.beerSensor),
        storedSetting: beerSetting,
        settingEnabled: true,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    // Profile
    {
      id: config.names.beerProfile,
      type: blockTypes.SetpointProfile,
      serviceId,
      groups,
      data: {
        start: new Date().getTime() / 1000,
        enabled: false,
        targetId: new Link(config.names.beerSetpoint),
        points: [
          { time: 0, temperature: beerSetting },
          { time: durationMs('7d') / 1000, temperature: beerSetting },
          { time: durationMs('10d') / 1000, temperature: beerSetting.copy(beerSetting.value! + 3) },
        ],
        drivenTargetId: new Link(null),
      },
    },
    // Mutex
    {
      id: config.names.mutex,
      type: blockTypes.Mutex,
      serviceId,
      groups,
      data: {
        differentActuatorWait: new Unit(15, 'minute'),
      },
    },
    // Digital Actuators
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
            { mutex: new Link(config.names.mutex), limiting: false },
            { minOn: new Unit(5, 'second'), limiting: false },
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
        hwDevice: new Link(config.heatPin ? config.heatPin!.arrayId : null),
        channel: config.heatPin ? config.heatPin!.pinId : 0,
        invert: false,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        constrainedBy: {
          constraints: [
            { mutex: new Link(config.names.mutex), limiting: false },
          ],
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
        period: new Unit(10, 'minute'),
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
    {
      id: config.names.coolPid,
      type: blockTypes.Pid,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
        kp: new Unit(-20, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(10, 'min'),
        enabled: true,
        inputId: new Link(config.names.beerSetpoint),
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
        kp: new Unit(20, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(10, 'min'),
        enabled: true,
        inputId: new Link(config.names.beerSetpoint),
        outputId: new Link(config.names.heatPwm),
      },
    },
  ] as [
      SetpointSensorPairBlock,
      SetpointProfileBlock,
      MutexBlock,
      DigitalActuatorBlock,
      DigitalActuatorBlock,
      ActuatorPwmBlock,
      ActuatorPwmBlock,
      PidBlock,
      PidBlock,
    ];

  if (config.glycolControl === 'Control') {
    blocks.push(
      // Setpoint
      {
        id: config.names.glycolSetpoint,
        type: blockTypes.SetpointSensorPair,
        serviceId,
        groups,
        data: {
          sensorId: new Link(config.names.glycolSensor),
          storedSetting: glycolSetting,
          settingEnabled: true,
          setting: new Unit(null, 'degC'),
          value: new Unit(null, 'degC'),
          valueUnfiltered: new Unit(null, 'degC'),
          filter: FilterChoice.Filter15s,
          filterThreshold: new Unit(5, 'delta_degC'),
          resetFilter: false,
        },
      } as SetpointSensorPairBlock,
      {
        id: config.names.glycolAct,
        type: blockTypes.DigitalActuator,
        serviceId,
        groups,
        data: {
          hwDevice: new Link(config.glycolPin!.arrayId),
          channel: config.glycolPin!.pinId,
          invert: false,
          desiredState: DigitalState.Inactive,
          state: DigitalState.Inactive,
          constrainedBy: {
            constraints: [
              { minOff: new Unit(300, 'second'), limiting: false },
              { minOn: new Unit(180, 'second'), limiting: false },
            ],
          },
        },
      } as DigitalActuatorBlock,

      // PWM
      {
        id: config.names.glycolPwm,
        type: blockTypes.ActuatorPwm,
        serviceId,
        groups,
        data: {
          enabled: true,
          period: new Unit(30, 'minute'),
          actuatorId: new Link(config.names.glycolAct),
          drivenActuatorId: new Link(null),
          setting: 0,
          desiredSetting: 0,
          value: 0,
          constrainedBy: { constraints: [] },
        },
      } as ActuatorPwmBlock,

      {
        id: config.names.glycolPid,
        type: blockTypes.Pid,
        serviceId,
        groups,
        data: {
          ...(sparkStore.specs[blockTypes.Pid].generate() as PidData),
          kp: new Unit(-20, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(5, 'min'),
          enabled: true,
          inputId: new Link(config.names.glycolSetpoint),
          outputId: new Link(config.names.glycolPwm),
        },
      } as PidBlock,
    );
  }

  return config.heated
    ? blocks
    : blocks.filter(block => !heatingBlocks.includes(block.id));
}

export function defineWidgets(config: GlycolConfig, layouts: BuilderLayout[]): PersistentWidget[] {
  const userTemp = sparkStore.units(config.serviceId).Temp;

  const createWidget = (name: string, type: string): PersistentWidget => ({
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

  const builder: BuilderItem = {
    ...createWidget(maybeSpace(config.prefix, 'Process'), 'Builder'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map(l => l.id),
    },
  };

  const graph: HistoryItem = {
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
            `${config.names.beerSensor}/value[${userTemp}]`,
            `${config.names.beerSetpoint}/setting[${userTemp}]`,
            `${config.names.coolPwm}/value`,
            `${config.names.coolAct}/state`,
          ],
        },
      ],
      renames: {
        [`${config.serviceId}/${config.names.beerSensor}/value[${userTemp}]`]: 'Beer temperature',
        [`${config.serviceId}/${config.names.beerSetpoint}/setting[${userTemp}]`]: 'Beer setting',
        [`${config.serviceId}/${config.names.coolPwm}/value`]: 'Cool PWM value',
        [`${config.serviceId}/${config.names.coolAct}/state`]: 'Cool Pin state',
      },
      axes: {
        [`${config.serviceId}/${config.names.coolPwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.coolAct}/state`]: 'y2',
      },
      colors: {},
    },
  };

  if (config.heated) {
    graph.config.targets[0].fields.push(
      `${config.names.heatPwm}/value`,
      `${config.names.heatAct}/state`,
    );
    Object.assign(graph.config.renames, {
      [`${config.serviceId}/${config.names.heatPwm}/value`]: 'Heat PWM value',
      [`${config.serviceId}/${config.names.heatAct}/state`]: 'Heat Pin state',
    });
    Object.assign(graph.config.axes, {
      [`${config.serviceId}/${config.names.heatPwm}/value`]: 'y2',
      [`${config.serviceId}/${config.names.heatAct}/state`]: 'y2',
    });
  }

  const QuickActions: QuickActionsItem = {
    ...createWidget(maybeSpace(config.prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 4,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      changeIdMigrated: true,
      serviceId: config.serviceId,
      steps: serialize([
        {
          name: 'Beer temperature control OFF',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: config.names.beerSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: config.names.beerProfile,
              data: { enabled: false },
              confirmed: {},
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointProfileBlock>,
            ],
        },
        {
          name: 'Constant beer temperature',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: config.names.beerProfile,
              data: { enabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: config.names.beerSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Unit(20.0, 'degC'),
              },
              confirmed: {
                storedSetting: true,
              },
            },
          ] as [
              BlockChange<SetpointProfileBlock>,
              BlockChange<SetpointSensorPairBlock>,
            ],
        },
        {
          name: 'Follow temperature profile',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: config.names.beerSetpoint,
              data: { settingEnabled: true },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: config.names.beerProfile,
              data: { enabled: true, start: new Date().getTime() / 1000 },
              confirmed: { start: true },
            },
          ] as [
              BlockChange<SetpointSensorPairBlock>,
              BlockChange<SetpointProfileBlock>,
            ],
        },
      ]),
    },
  };

  const profile: PersistentWidget = {
    ...createWidget(config.names.beerProfile, blockTypes.SetpointProfile),
    cols: 6,
    rows: 4,
    pinnedPosition: { x: 5, y: 6 },
  };

  return [
    builder,
    graph,
    QuickActions,
    profile,
  ];
}
