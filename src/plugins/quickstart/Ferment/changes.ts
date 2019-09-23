import { uid } from 'quasar';

import { Link, Unit } from '@/helpers/units';
import { MutexLink, ProcessValueLink, SetpointSensorPairLink } from '@/helpers/units/KnownLinks';
import { serialize } from '@/helpers/units/parseObject';
import { typeName as builderType } from '@/plugins/builder/getters';
import { BuilderItem, BuilderLayout } from '@/plugins/builder/types';
import { HistoryItem } from '@/plugins/history/Graph/types';
import { typeName as pwmType } from '@/plugins/spark/features/ActuatorPwm/getters';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';
import { typeName as digiActType } from '@/plugins/spark/features/DigitalActuator/getters';
import { DigitalActuatorBlock } from '@/plugins/spark/features/DigitalActuator/types';
import { typeName as mutexType } from '@/plugins/spark/features/Mutex/getters';
import { MutexBlock } from '@/plugins/spark/features/Mutex/types';
import { typeName as pidType } from '@/plugins/spark/features/Pid/getters';
import { PidBlock, PidData } from '@/plugins/spark/features/Pid/types';
import { typeName as spProfileType } from '@/plugins/spark/features/SetpointProfile/getters';
import { SetpointProfileBlock } from '@/plugins/spark/features/SetpointProfile/types';
import { typeName as setpointType } from '@/plugins/spark/features/SetpointSensorPair/getters';
import { FilterChoice, SetpointSensorPairBlock } from '@/plugins/spark/features/SetpointSensorPair/types';
import { StepViewItem } from '@/plugins/spark/features/StepView/types';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { unlinkedActuators } from '../helpers';
import { FermentConfig } from './types';

export const defineChangedBlocks = (config: FermentConfig): Block[] => {
  return unlinkedActuators(config.serviceId, [config.heatPin, config.coolPin]);
};

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


export const defineCreatedBlocks = (
  config: FermentConfig,
  fridgeSetting: Unit,
  beerSetting: Unit,
  activeSetpoint: 'beer' | 'fridge'
): Block[] => {
  const isBeer = activeSetpoint === 'beer';
  const activeSetpointId = isBeer ? config.names.beerSSPair : config.names.fridgeSSPair;

  const coolPidConfig: Partial<PidData> = isBeer
    ? beerCoolConfig
    : fridgeCoolConfig;

  const heatPidConfig: Partial<PidData> = isBeer
    ? beerHeatConfig
    : fridgeHeatConfig;

  return [
    // setpoint sensor pair
    {
      id: config.names.fridgeSSPair,
      serviceId: config.serviceId,
      type: setpointType,
      groups: config.groups,
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
      id: config.names.beerSSPair,
      serviceId: config.serviceId,
      type: setpointType,
      groups: config.groups,
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
      serviceId: config.serviceId,
      type: mutexType,
      groups: config.groups,
      data: {
        differentActuatorWait: new Unit(45, 'minute'),
      },
    },
    // Digital Actuator
    {
      id: config.names.coolAct,
      serviceId: config.serviceId,
      type: digiActType,
      groups: config.groups,
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
            { mutex: new MutexLink(config.names.mutex), limiting: false },
          ],
        },
      },
    },
    {
      id: config.names.heatAct,
      serviceId: config.serviceId,
      type: digiActType,
      groups: config.groups,
      data: {
        hwDevice: new Link(config.heatPin.arrayId),
        channel: config.heatPin.pinId,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        invert: false,
        constrainedBy: {
          constraints: [{ mutex: new MutexLink(config.names.mutex), limiting: false }],
        },
      },
    },
    // PWM
    {
      id: config.names.coolPwm,
      serviceId: config.serviceId,
      type: pwmType,
      groups: config.groups,
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
      serviceId: config.serviceId,
      type: pwmType,
      groups: config.groups,
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
      serviceId: config.serviceId,
      type: spProfileType,
      groups: config.groups,
      data: {
        start: new Date().getTime() / 1000,
        enabled: false,
        targetId: new Link(activeSetpointId),
        points: [],
        drivenTargetId: new Link(null),
      },
    },
    // PID
    {
      id: config.names.coolPid,
      serviceId: config.serviceId,
      type: pidType,
      groups: config.groups,
      data: {
        ...(sparkStore.specs[pidType].generate() as PidData),
        ...coolPidConfig,
        enabled: true,
        inputId: new Link(activeSetpointId),
        outputId: new Link(config.names.coolPwm),
      },
    },
    {
      id: config.names.heatPid,
      serviceId: config.serviceId,
      type: pidType,
      groups: config.groups,
      data: {
        ...(sparkStore.specs[pidType].generate() as PidData),
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

export const defineLayouts = (config: FermentConfig): BuilderLayout[] => {
  return [
    {
      id: uid(),
      title: `${config.prefix} Fridge Layout`,
      width: 6,
      height: 10,
      parts: [
        {
          id: uid(),
          type: 'Fridge',
          x: 2,
          y: 1,
          rotate: 0,
          flipped: false,
          settings: {
            sizeY: 7,
            text: `${config.prefix} fridge`,
          },
        },
        {
          id: uid(),
          type: 'Carboy',
          x: 3,
          y: 3,
          rotate: 0,
          flipped: false,
          settings: {
            color: 'E1AC00',
            setpoint: {
              serviceId: config.serviceId,
              blockId: config.names.beerSSPair,
            },
          },
        },
        {
          id: uid(),
          type: 'SetpointDisplay',
          x: 2,
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
            setpoint: {
              serviceId: config.serviceId,
              blockId: config.names.fridgeSSPair,
            },
          },
        },
        {
          id: uid(),
          type: 'PidDisplay',
          x: 4,
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
            pid: {
              serviceId: config.serviceId,
              blockId: config.names.coolPid,
            },
          },
        },
        {
          id: uid(),
          type: 'PidDisplay',
          x: 5,
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
            pid: {
              serviceId: config.serviceId,
              blockId: config.names.heatPid,
            },
          },
        },
        {
          id: uid(),
          type: 'UrlDisplay',
          x: 2,
          y: 0,
          rotate: 0,
          flipped: false,
          settings: {
            text: 'User manual',
            url: 'https://brewblox.netlify.com/user/ferment_guide.html#ferment-fridge-process-view',
            sizeX: 4,
            sizeY: 1,
          },
        },
      ],
    },
  ];
};

export const defineWidgets = (config: FermentConfig, layouts: BuilderLayout[]): DashboardItem[] => {
  const genericSettings = {
    dashboard: config.dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

  const userTemp = sparkStore.units(config.serviceId).Temp;

  const createWidget = (name: string, type: string): DashboardItem => ({
    ...genericSettings,
    ...featureStore.widgetSizeById(type),
    id: uid(),
    title: name,
    feature: type,
    order: 0,
    config: {
      blockId: name,
      serviceId: config.serviceId,
    },
  });

  const createBuilder = (): BuilderItem => ({
    ...createWidget(`${config.prefix} Fridge`, builderType),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 1, y: 1 },
    config: {
      currentToolId: 'config',
      currentLayoutId: layouts[0].id,
      layoutIds: layouts.map(l => l.id),
    },
  });

  const createGraph = (): HistoryItem => ({
    ...createWidget(`${config.prefix} Graph`, 'Graph'),
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
            `${config.names.fridgeSSPair}/setting[${userTemp}]`,
            `${config.names.beerSSPair}/setting[${userTemp}]`,
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
        [`${config.serviceId}/${config.names.fridgeSSPair}/setting[${userTemp}]`]: 'Fridge setting',
        [`${config.serviceId}/${config.names.beerSSPair}/setting[${userTemp}]`]: 'Beer setting',
        [`${config.serviceId}/${config.names.coolPwm}/value`]: 'Cool PWM value',
        [`${config.serviceId}/${config.names.heatPwm}/value`]: 'Heat PWM value',
        [`${config.serviceId}/${config.names.coolAct}/state`]: 'Cool Pin state',
        [`${config.serviceId}/${config.names.heatAct}/state`]: 'Heat Pin state',
      },
      axes: {
        [`${config.serviceId}/${config.names.coolPwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.heatPwm}/value`]: 'y2',
      },
      colors: {},
    },
  });

  const createStepView = (): StepViewItem => ({
    ...createWidget(`${config.prefix} Actions`, 'StepView'),
    cols: 4,
    rows: 4,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      serviceId: config.serviceId,
      steps: serialize([
        {
          name: 'Enable control',
          id: uid(),
          changes: [
            {
              blockId: config.names.beerSSPair,
              data: { settingEnabled: true },
            },
            {
              blockId: config.names.fridgeSSPair,
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
              blockId: config.names.beerSSPair,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.fridgeSSPair,
              data: { settingEnabled: false },
            },
          ],
        },
        {
          name: 'Constant fridge temperature',
          id: uid(),
          changes: [
            {
              blockId: config.names.fridgeSSPair,
              data: { settingEnabled: true },
            },
            {
              blockId: config.names.beerSSPair,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.coolPid,
              data: {
                inputId: new ProcessValueLink(config.names.fridgeSSPair),
                ...fridgeCoolConfig,
              },
              confirmed: {
                kp: true,
                ti: true,
                td: true,
              },
            },
            {
              blockId: config.names.heatPid,
              data: {
                inputId: new ProcessValueLink(config.names.fridgeSSPair),
                ...fridgeHeatConfig,
              },
              confirmed: {
                kp: true,
                ti: true,
                td: true,
              },
            },
            {
              blockId: config.names.tempProfile,
              data: { targetId: new SetpointSensorPairLink(config.names.fridgeSSPair) },
            },
          ],
        },
        {
          name: 'Constant beer temperature',
          id: uid(),
          changes: [
            {
              blockId: config.names.fridgeSSPair,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.beerSSPair,
              data: { settingEnabled: true },
            },
            {
              blockId: config.names.coolPid,
              data: {
                inputId: new ProcessValueLink(config.names.beerSSPair),
                ...beerCoolConfig,
              },
              confirmed: {
                kp: true,
                ti: true,
                td: true,
              },
            },
            {
              blockId: config.names.heatPid,
              data: {
                inputId: new ProcessValueLink(config.names.beerSSPair),
                ...beerHeatConfig,
              },
              confirmed: {
                kp: true,
                ti: true,
                td: true,
              },
            },
            {
              blockId: config.names.tempProfile,
              data: { targetId: new SetpointSensorPairLink(config.names.beerSSPair) },
            },
          ],
        },
        {
          name: 'Start profile',
          id: uid(),
          changes: [
            {
              blockId: config.names.tempProfile,
              data: { enabled: true, start: new Date().getTime() / 1000 },
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

  const createProfile = (name: string): DashboardItem => ({
    ...createWidget(name, spProfileType),
    cols: 6,
    rows: 4,
    pinnedPosition: { x: 5, y: 6 },
  });

  return [createBuilder(), createGraph(), createStepView(), createProfile(config.names.tempProfile)];
};
