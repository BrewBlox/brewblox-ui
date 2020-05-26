import { uid } from 'quasar';

import { durationMs } from '@/helpers/functional';
import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { GraphConfig } from '@/plugins/history/types';
import { BlockChange, QuickActionsConfig } from '@/plugins/spark/features/QuickActions/types';
import { blockTypes } from '@/plugins/spark/getters';
import { serialize } from '@/plugins/spark/parse-object';
import { sparkStore } from '@/plugins/spark/store';
import {
  ActuatorPwmBlock,
  Block,
  DigitalActuatorBlock,
  FilterChoice,
  MutexBlock,
  PidBlock,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from '@/plugins/spark/types';
import { DigitalState } from '@/plugins/spark/types';
import { Link, Temp, Time, Unit } from '@/plugins/spark/units';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { pidDefaults, unlinkedActuators, withoutPrefix, withPrefix } from '../helpers';
import { DisplayBlock } from '../types';
import { GlycolConfig, GlycolOpts } from './types';


export function defineChangedBlocks(config: GlycolConfig): Block[] {
  const pins = config.heated ? [config.heatPin!, config.coolPin] : [config.coolPin];
  return unlinkedActuators(config.serviceId, pins);
};

export function defineCreatedBlocks(config: GlycolConfig, opts: GlycolOpts): Block[] {
  const { serviceId, names } = config;
  const { beerSetting, glycolSetting } = opts;
  const groups = [0];

  const heatingBlocks = [
    names.heatPid,
    names.heatPwm,
    names.heatAct,
  ];

  const blocks: [
    SetpointSensorPairBlock,
    SetpointProfileBlock,
    MutexBlock,
    DigitalActuatorBlock,
    DigitalActuatorBlock,
    ActuatorPwmBlock,
    ActuatorPwmBlock,
    PidBlock,
    PidBlock,
  ] = [
      // Setpoint
      {
        id: names.beerSetpoint,
        type: 'SetpointSensorPair',
        serviceId,
        groups,
        data: {
          sensorId: new Link(names.beerSensor),
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
        id: names.beerProfile,
        type: 'SetpointProfile',
        serviceId,
        groups,
        data: {
          start: new Date().getTime() / 1000,
          enabled: false,
          targetId: new Link(names.beerSetpoint),
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
        id: names.mutex,
        type: 'Mutex',
        serviceId,
        groups,
        data: {
          differentActuatorWait: new Time(5, 'min'),
          waitRemaining: new Time(),
        },
      },
      // Digital Actuators
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
                mutexed: {
                  mutexId: new Link(names.mutex, 'Mutex'),
                  extraHoldTime: new Time(15, 'min'),
                  hasCustomHoldTime: true,
                  hasLock: false,
                },
                remaining: new Time(),
              },
              {
                minOn: new Time(5, 's'),
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
          hwDevice: new Link(config.heatPin ? config.heatPin!.arrayId : null),
          channel: config.heatPin ? config.heatPin!.pinId : 0,
          invert: false,
          desiredState: DigitalState.Inactive,
          state: DigitalState.Inactive,
          constrainedBy: {
            constraints: [
              {
                mutexed: {
                  mutexId: new Link(names.mutex, 'Mutex'),
                  extraHoldTime: new Time(15, 'min'),
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
          period: new Time(10, 'min'),
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
      {
        id: names.coolPid,
        type: 'Pid',
        serviceId,
        groups,
        data: {
          ...pidDefaults(),
          kp: new Unit(-20, '1/degC'),
          ti: new Time(2, 'hour'),
          td: new Time(10, 'min'),
          enabled: true,
          inputId: new Link(names.beerSetpoint),
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
          kp: new Unit(100, '1/degC'),
          ti: new Time(2, 'hour'),
          td: new Time(10, 'min'),
          enabled: true,
          inputId: new Link(names.beerSetpoint),
          outputId: new Link(names.heatPwm),
        },
      },
    ];

  if (config.glycolControl === 'Control') {
    const glycolControlBlocks: [
      SetpointSensorPairBlock,
      DigitalActuatorBlock,
      ActuatorPwmBlock,
      PidBlock
    ] = [
        // Setpoint
        {
          id: names.glycolSetpoint,
          type: 'SetpointSensorPair',
          serviceId,
          groups,
          data: {
            sensorId: new Link(names.glycolSensor),
            storedSetting: glycolSetting,
            settingEnabled: true,
            setting: new Unit(null, 'degC'),
            value: new Unit(null, 'degC'),
            valueUnfiltered: new Unit(null, 'degC'),
            filter: FilterChoice.Filter15s,
            filterThreshold: new Unit(5, 'delta_degC'),
            resetFilter: false,
          },
        },
        // Digital actuator
        {
          id: names.glycolAct,
          type: 'DigitalActuator',
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
                { minOff: new Time(5, 'min'), remaining: new Time() },
                { minOn: new Time(3, 'min'), remaining: new Time() },
              ],
            },
          },
        },
        // PWM
        {
          id: names.glycolPwm,
          type: 'ActuatorPwm',
          serviceId,
          groups,
          data: {
            enabled: true,
            period: new Time(30, 'min'),
            actuatorId: new Link(names.glycolAct),
            drivenActuatorId: new Link(null),
            setting: 0,
            desiredSetting: 0,
            value: 0,
            constrainedBy: { constraints: [] },
          },
        },
        {
          id: names.glycolPid,
          type: 'Pid',
          serviceId,
          groups,
          data: {
            ...pidDefaults(),
            kp: new Unit(-20, '1/degC'),
            ti: new Time(2, 'hour'),
            td: new Time(5, 'min'),
            enabled: true,
            inputId: new Link(names.glycolSetpoint),
            outputId: new Link(names.glycolPwm),
          },
        },
      ];

    blocks.push(...glycolControlBlocks);
  }

  return config.heated
    ? blocks
    : blocks.filter(block => !heatingBlocks.includes(block.id));
}

export function defineWidgets(config: GlycolConfig, layouts: BuilderLayout[]): Widget[] {
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
    cols: 4,
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
    pinnedPosition: { x: 5, y: 1 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: serviceId,
          fields: [
            `${names.beerSensor}/value[${userTemp}]`,
            `${names.beerSetpoint}/setting[${userTemp}]`,
            `${names.coolPwm}/value`,
            `${names.coolAct}/state`,
          ],
        },
      ],
      renames: {
        [`${serviceId}/${names.beerSensor}/value[${userTemp}]`]: 'Beer temperature',
        [`${serviceId}/${names.beerSetpoint}/setting[${userTemp}]`]: 'Beer setting',
        [`${serviceId}/${names.coolPwm}/value`]: 'Cool PWM value',
        [`${serviceId}/${names.coolAct}/state`]: 'Cool Pin state',
      },
      axes: {
        [`${serviceId}/${names.coolPwm}/value`]: 'y2',
        [`${serviceId}/${names.coolAct}/state`]: 'y2',
      },
      colors: {},
    },
  };

  if (config.heated) {
    graph.config.targets[0].fields.push(
      `${names.heatPwm}/value`,
      `${names.heatAct}/state`,
    );
    Object.assign(graph.config.renames, {
      [`${serviceId}/${names.heatPwm}/value`]: 'Heat PWM value',
      [`${serviceId}/${names.heatAct}/state`]: 'Heat Pin state',
    });
    Object.assign(graph.config.axes, {
      [`${serviceId}/${names.heatPwm}/value`]: 'y2',
      [`${serviceId}/${names.heatAct}/state`]: 'y2',
    });
  }

  const QuickActions: Widget<QuickActionsConfig> = {
    ...createWidget(withPrefix(prefix, 'Actions'), 'QuickActions'),
    cols: 4,
    rows: 4,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      serviceId,
      changeIdMigrated: true,
      serviceIdMigrated: true,
      steps: serialize([
        {
          name: 'Beer temperature control OFF',
          id: uid(),
          changes: [
            {
              id: uid(),
              blockId: names.beerSetpoint,
              data: { settingEnabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: names.beerProfile,
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
              serviceId,
              blockId: names.beerProfile,
              data: { enabled: false },
              confirmed: {},
            },
            {
              id: uid(),
              serviceId,
              blockId: names.beerSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Temp(20.0, 'degC').convert(userTemp),
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
              blockId: names.beerSetpoint,
              data: { settingEnabled: true },
              confirmed: {},
            },
            {
              id: uid(),
              blockId: names.beerProfile,
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

  const profile: Widget = {
    ...createWidget(names.beerProfile, blockTypes.SetpointProfile),
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

export const defineDisplayedBlocks = (config: GlycolConfig): DisplayBlock[] => {
  const { coolPid, heatPid } = config.names;
  const output = [
    {
      blockId: coolPid,
      opts: {
        showDialog: false,
        color: '037cd5',
        name: withoutPrefix(config.prefix, coolPid),
      },
    },
  ];
  if (config.heated) {
    output.push({
      blockId: heatPid,
      opts: {
        showDialog: false,
        color: 'df2b35',
        name: withoutPrefix(config.prefix, heatPid),
      },
    });
  }
  return output;
};
