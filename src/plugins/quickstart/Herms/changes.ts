import { uid } from 'quasar';

import { WizardAction } from '@/components/Wizard/WizardTaskBase';
import { Link, Unit } from '@/helpers/units';
import { BalancerLink, MutexLink } from '@/helpers/units/KnownLinks';
import { serialize } from '@/helpers/units/parseObject';
import { typeName as builderType } from '@/plugins/builder/getters';
import { builderStore } from '@/plugins/builder/store';
import { BuilderItem, BuilderLayout } from '@/plugins/builder/types';
import { HistoryItem } from '@/plugins/history/Graph/types';
import { sparkStore } from '@/plugins/spark/store';
import { Dashboard, DashboardItem, dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { AnalogConstraint, DigitalConstraint } from '../../spark/components/Constraints/ConstraintsBase';
import { typeName as driverType } from '../../spark/features/ActuatorOffset/getters';
import { ActuatorOffsetBlock, OffsetSettingOrValue } from '../../spark/features/ActuatorOffset/types';
import { typeName as pwmType } from '../../spark/features/ActuatorPwm/getters';
import { ActuatorPwmBlock } from '../../spark/features/ActuatorPwm/types';
import { typeName as balancerType } from '../../spark/features/Balancer/getters';
import { BalancerBlock } from '../../spark/features/Balancer/types';
import { typeName as digiActType } from '../../spark/features/DigitalActuator/getters';
import { DigitalActuatorBlock } from '../../spark/features/DigitalActuator/types';
import { typeName as mutexType } from '../../spark/features/Mutex/getters';
import { MutexBlock } from '../../spark/features/Mutex/types';
import { typeName as pidType } from '../../spark/features/Pid/getters';
import { PidBlock, PidData } from '../../spark/features/Pid/types';
import { typeName as setpointType } from '../../spark/features/SetpointSensorPair/getters';
import { FilterChoice, SetpointSensorPairBlock } from '../../spark/features/SetpointSensorPair/types';
import { StepViewItem } from '../../spark/features/StepView/types';
import { Block, DigitalState } from '../../spark/types';
import { HermsConfig, PinChannel } from './types';

export interface PidOpts {
  hltKp: Unit;
  bkKp: Unit;
  mtKp: Unit;
  driverMax: Unit;
}

export function defineChangedBlocks(config: HermsConfig): Block[] {
  return (
    sparkStore
      .blockValues(config.serviceId)
      // Find existing drivers of selected pins
      .filter(
        block =>
          block.type === digiActType &&
          [config.hltPin, config.bkPin].some(
            (pin: PinChannel) => pin.arrayId === block.data.hwDevice.id && pin.pinId === block.data.channel
          )
      )
      // Unlink them from pin
      .map((block: DigitalActuatorBlock) => {
        block.data.channel = 0;
        return block;
      })
  );
};

export function defineCreatedBlocks(config: HermsConfig, opts: PidOpts): Block[] {
  const groups = [0];
  const serviceId = config.serviceId;

  const pwmConstraints: AnalogConstraint[] = [];
  const actuatorConstraints: DigitalConstraint[] = [];

  if (config.mutex) {
    pwmConstraints.push({
      balanced: {
        balancerId: new BalancerLink(config.names.balancer),
        granted: 0,
        id: 0,
      },
      limiting: false,
    });
    actuatorConstraints.push(
      { mutex: new MutexLink(config.names.mutex), limiting: false }
    );
  }

  const balancerBlocks = [
    {
      id: config.names.balancer,
      type: balancerType,
      serviceId,
      groups,
      data: { clients: [] },
    },
    {
      id: config.names.mutex,
      type: mutexType,
      serviceId,
      groups,
      data: {
        differentActuatorWait: new Unit(0, 'second'),
      },
    },
  ] as [
      BalancerBlock,
      MutexBlock,
    ];

  const baseBlocks = [
    // Setpoints
    {
      id: config.names.hltSetpoint,
      type: setpointType,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.hltSensor),
        storedSetting: new Unit(70, 'degC'),
        settingEnabled: false,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    {
      id: config.names.mtSetpoint,
      type: setpointType,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.mtSensor),
        storedSetting: new Unit(67, 'degC'),
        settingEnabled: false,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    {
      id: config.names.bkSetpoint,
      type: setpointType,
      serviceId,
      groups,
      data: {
        sensorId: new Link(config.names.bkSensor),
        storedSetting: new Unit(70, 'degC'),
        settingEnabled: false,
        setting: new Unit(null, 'degC'),
        value: new Unit(null, 'degC'),
        valueUnfiltered: new Unit(null, 'degC'),
        filter: FilterChoice.Filter15s,
        filterThreshold: new Unit(5, 'delta_degC'),
        resetFilter: false,
      },
    },
    // Setpoint Driver
    {
      id: config.names.hltDriver,
      type: driverType,
      serviceId,
      groups,
      data: {
        targetId: new Link(config.names.hltSetpoint),
        drivenTargetId: new Link(config.names.hltSetpoint),
        referenceId: new Link(config.names.mtSetpoint),
        referenceSettingOrValue: OffsetSettingOrValue.Setting,
        enabled: false,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: {
          constraints: [
            {
              max: opts.driverMax.value,
              limiting: false,
            },
          ],
        },
      },
    },
    // Digital Actuators
    {
      id: config.names.hltAct,
      type: digiActType,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.hltPin.arrayId),
        channel: config.hltPin.pinId,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        invert: false,
        constrainedBy: {
          constraints: actuatorConstraints,
        },
      },
    },
    {
      id: config.names.bkAct,
      type: digiActType,
      serviceId,
      groups,
      data: {
        hwDevice: new Link(config.bkPin.arrayId),
        channel: config.bkPin.pinId,
        desiredState: DigitalState.Inactive,
        state: DigitalState.Inactive,
        invert: false,
        constrainedBy: {
          constraints: actuatorConstraints,
        },
      },
    },
    // PWM
    {
      id: config.names.hltPwm,
      type: pwmType,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(2, 'second'),
        actuatorId: new Link(config.names.hltAct),
        drivenActuatorId: new Link(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: {
          constraints: pwmConstraints,
        },
      },
    },
    {
      id: config.names.bkPwm,
      type: pwmType,
      serviceId,
      groups,
      data: {
        enabled: true,
        period: new Unit(2, 'second'),
        actuatorId: new Link(config.names.bkAct),
        drivenActuatorId: new Link(null),
        setting: 0,
        desiredSetting: 0,
        value: 0,
        constrainedBy: {
          constraints: pwmConstraints,
        },
      },
    },
    // PID
    {
      id: config.names.hltPid,
      type: pidType,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[pidType].generate() as PidData),
        enabled: true,
        inputId: new Link(config.names.hltSetpoint),
        outputId: new Link(config.names.hltPwm),
        kp: opts.hltKp,
        ti: new Unit(10, 'min'),
        td: new Unit(10, 'second'),
        integralReset: 0,
        boilMinOutput: 25,
      },
    },
    {
      id: config.names.mtPid,
      type: pidType,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[pidType].generate() as PidData),
        enabled: true,
        inputId: new Link(config.names.mtSetpoint),
        outputId: new Link(config.names.hltDriver),
        kp: opts.mtKp,
        ti: new Unit(5, 'min'),
        td: new Unit(10, 'min'),
        integralReset: 0,
      },
    },
    {
      id: config.names.bkPid,
      type: pidType,
      serviceId,
      groups,
      data: {
        ...(sparkStore.specs[pidType].generate() as PidData),
        enabled: true,
        inputId: new Link(config.names.bkSetpoint),
        outputId: new Link(config.names.bkPwm),
        kp: opts.bkKp,
        ti: new Unit(5, 'min'),
        td: new Unit(10, 'min'),
        integralReset: 0,
        boilMinOutput: 25,
      },
    },
  ] as [
      SetpointSensorPairBlock,
      SetpointSensorPairBlock,
      SetpointSensorPairBlock,
      ActuatorOffsetBlock,
      DigitalActuatorBlock,
      DigitalActuatorBlock,
      ActuatorPwmBlock,
      ActuatorPwmBlock,
      PidBlock,
      PidBlock,
      PidBlock,
    ];

  return config.mutex
    ? [...balancerBlocks, ...baseBlocks]
    : baseBlocks;
}


export function defineWidgets(config: HermsConfig, layouts: BuilderLayout[]): DashboardItem[] {
  const userTemp = sparkStore.units(config.serviceId).Temp;
  const genericSettings = {
    dashboard: config.dashboardId,
    cols: 4,
    rows: 4,
    order: 0,
  };

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
    ...createWidget(`${config.prefix} Diagram`, builderType),
    cols: 11,
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
    cols: 7,
    rows: 5,
    pinnedPosition: { x: 1, y: 6 },
    config: {
      layout: {},
      params: { duration: '10m' },
      targets: [
        {
          measurement: config.serviceId,
          fields: [
            `${config.names.hltSensor}/value[${userTemp}]`,
            `${config.names.mtSensor}/value[${userTemp}]`,
            `${config.names.bkSensor}/value[${userTemp}]`,
            `${config.names.hltSetpoint}/setting[${userTemp}]`,
            `${config.names.mtSetpoint}/setting[${userTemp}]`,
            `${config.names.bkSetpoint}/setting[${userTemp}]`,
            `${config.names.hltPwm}/value`,
            `${config.names.bkPwm}/value`,
          ],
        },
      ],
      renames: {
        [`${config.serviceId}/${config.names.hltSensor}/value[${userTemp}]`]: 'HLT temperature',
        [`${config.serviceId}/${config.names.mtSensor}/value[${userTemp}]`]: 'MT temperature',
        [`${config.serviceId}/${config.names.bkSensor}/value[${userTemp}]`]: 'BK temperature',
        [`${config.serviceId}/${config.names.hltSetpoint}/setting[${userTemp}]`]: 'HLT setting',
        [`${config.serviceId}/${config.names.mtSetpoint}/setting[${userTemp}]`]: 'MT setting',
        [`${config.serviceId}/${config.names.bkSetpoint}/setting[${userTemp}]`]: 'BK setting',
        [`${config.serviceId}/${config.names.hltPwm}/value`]: 'HLT PWM value',
        [`${config.serviceId}/${config.names.bkPwm}/value`]: 'BK PWM value',
      },
      axes: {
        [`${config.serviceId}/${config.names.hltPwm}/value`]: 'y2',
        [`${config.serviceId}/${config.names.bkPwm}/value`]: 'y2',
      },
      colors: {},
    },
  });

  const createStepView = (): StepViewItem => ({
    ...createWidget(`${config.prefix} Actions`, 'StepView'),
    cols: 4,
    rows: 5,
    pinnedPosition: { x: 8, y: 6 },
    config: {
      serviceId: config.serviceId,
      steps: serialize([
        {
          name: 'Disable all setpoints',
          id: uid(),
          changes: [
            {
              blockId: config.names.hltSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.mtSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.bkSetpoint,
              data: { settingEnabled: false },
            },
          ],
        },
        {
          name: 'Constant HLT Temp',
          id: uid(),
          changes: [
            {
              blockId: config.names.mtSetpoint,
              data: { settingEnabled: false },
            },
            {
              blockId: config.names.hltSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Unit(70, 'degC'),
              },
              confirmed: {
                storedSetting: true,
              },
            },
          ],
        },
        {
          name: 'Constant MT Temp',
          id: uid(),
          changes: [
            {
              blockId: config.names.mtSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Unit(66.7, 'degC'),
              },
              confirmed: {
                storedSetting: true,
              },
            },
            {
              blockId: config.names.hltDriver,
              data: {
                enabled: true,
              },
            },
          ],
        },
        {
          name: 'Constant BK Temp',
          id: uid(),
          changes: [
            {
              blockId: config.names.bkSetpoint,
              data: {
                settingEnabled: true,
                storedSetting: new Unit(100, 'degC'),
              },
              confirmed: {
                storedSetting: true,
              },
            },
          ],
        },
      ]),
    },
  });

  return [createBuilder(), createGraph(), createStepView()];
}

export function createActions(): WizardAction[] {
  return [
    // Rename blocks
    async (config: HermsConfig) => {
      await Promise.all(
        Object.entries(config.renamedBlocks)
          .filter(([currVal, newVal]: [string, string]) => currVal !== newVal)
          .map(([currVal, newVal]: [string, string]) => sparkStore.renameBlock([config.serviceId, currVal, newVal]))
      );
    },

    // Change blocks
    async (config: HermsConfig) => {
      await Promise.all(
        config.changedBlocks
          .map(block => sparkStore.saveBlock([config.serviceId, block])));
    },

    // Create blocks
    async (config: HermsConfig) => {
      // Create synchronously, to ensure dependencies are created first
      for (const block of config.createdBlocks) {
        await sparkStore.createBlock([config.serviceId, block]);
      }
    },

    // Create layouts
    async (config: HermsConfig) => {
      await Promise.all(
        config.layouts
          .map(builderStore.createLayout)
      );
    },

    // Create dashboards / widgets
    async (config: HermsConfig) => {
      if (!dashboardStore.dashboardIds.includes(config.dashboardId)) {
        const dashboard: Dashboard = {
          id: config.dashboardId,
          title: config.dashboardTitle,
          order: dashboardStore.dashboardIds.length + 1,
        };
        await dashboardStore.createDashboard(dashboard);
      }
      for (const widget of config.widgets) {
        await dashboardStore.appendDashboardItem(widget);
      }
    },
  ];
}
