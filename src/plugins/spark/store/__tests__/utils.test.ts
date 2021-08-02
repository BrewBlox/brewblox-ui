import {
  ActuatorPwmBlock,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  FilterChoice,
  PidBlock,
  SetpointSensorPairBlock,
  Spark3PinsBlock,
  TempSensorOneWireBlock,
} from '@/shared-types';
import { bloxLink } from '@/utils/link';
import {
  bloxQty,
  deltaTempMultHourQty,
  deltaTempPerMinuteQty,
  deltaTempQty,
  inverseTempQty,
  tempQty,
} from '@/utils/quantity';

import { calculateDrivenChains, calculateLimitations, calculateRelations } from '../utils';

describe('Calculate relational data', () => {
  const blocks: [
    TempSensorOneWireBlock,
    SetpointSensorPairBlock,
    PidBlock,
    ActuatorPwmBlock,
    DigitalActuatorBlock,
    PidBlock,
    ActuatorPwmBlock,
    DigitalActuatorBlock,
    Spark3PinsBlock,
  ] = [
      {
        id: 'Sensor',
        type: BlockType.TempSensorOneWire,
        groups: [0],
        serviceId: 'test',
        data: {
          address: 'deadbeef',
          offset: deltaTempQty(0),
          value: tempQty(20),
        },
      },
      {
        id: 'Setpoint',
        type: BlockType.SetpointSensorPair,
        groups: [0],
        serviceId: 'test',
        data: {
          sensorId: bloxLink('Sensor', BlockType.TempSensorOneWire),
          storedSetting: tempQty(20),
          setting: tempQty(null),
          value: tempQty(null),
          valueUnfiltered: tempQty(null),
          resetFilter: false,
          settingEnabled: true,
          filter: FilterChoice.FILTER_15s,
          filterThreshold: deltaTempQty(5),
        },
      },
      {
        id: 'Heat PID',
        type: BlockType.Pid,
        groups: [0],
        serviceId: 'test',
        data: {
          inputValue: tempQty(0),
          inputSetting: tempQty(0),
          outputValue: 0,
          outputSetting: 0,
          enabled: false,
          active: true,
          kp: inverseTempQty(20),
          ti: bloxQty('2h'),
          td: bloxQty('0s'),
          p: 0,
          i: 0,
          d: 0,
          error: deltaTempQty(0),
          integral: deltaTempMultHourQty(0),
          derivative: deltaTempPerMinuteQty(0),
          derivativeFilter: FilterChoice.FILTER_NONE,
          integralReset: 0,
          boilPointAdjust: deltaTempQty(0),
          boilMinOutput: 0,
          boilModeActive: false,
          inputId: bloxLink('Setpoint', BlockType.SetpointSensorPair),
          outputId: bloxLink('Heat PWM', BlockType.ActuatorPwm),
          drivenOutputId: bloxLink('Heat PWM', BlockType.ActuatorPwm, true),
        },
      },
      {
        id: 'Heat PWM',
        type: BlockType.ActuatorPwm,
        groups: [0],
        serviceId: 'test',
        data: {
          constrainedBy: { constraints: [] },
          desiredSetting: 50,
          setting: 50,
          value: 50,
          actuatorId: bloxLink('Heat Actuator', BlockType.DigitalActuator),
          drivenActuatorId: bloxLink('Heat Actuator', BlockType.DigitalActuator, true),
          enabled: true,
          period: bloxQty('10s'),
        },
      },
      {
        id: 'Heat Actuator',
        type: BlockType.DigitalActuator,
        groups: [0],
        serviceId: 'test',
        data: {
          channel: 0,
          constrainedBy: {
            constraints: [{
              remaining: bloxQty(null, 's'),
              delayedOn: bloxQty('1h'),
            }],
          },
          desiredState: DigitalState.STATE_ACTIVE,
          state: DigitalState.STATE_ACTIVE,
          hwDevice: bloxLink('Spark Pins', BlockType.Spark3Pins, true),
          invert: false,
        },
      },
      {
        id: 'Cool PID',
        type: BlockType.Pid,
        groups: [0],
        serviceId: 'test',
        data: {
          inputValue: tempQty(0),
          inputSetting: tempQty(0),
          outputValue: 0,
          outputSetting: 0,
          enabled: false,
          active: true,
          kp: inverseTempQty(20),
          ti: bloxQty('2h'),
          td: bloxQty('0s'),
          p: 0,
          i: 0,
          d: 0,
          error: deltaTempQty(0),
          integral: deltaTempMultHourQty(0),
          derivative: deltaTempPerMinuteQty(0),
          derivativeFilter: FilterChoice.FILTER_NONE,
          integralReset: 0,
          boilPointAdjust: deltaTempQty(0),
          boilMinOutput: 0,
          boilModeActive: false,
          inputId: bloxLink('Setpoint', BlockType.SetpointSensorPair),
          outputId: bloxLink('Cool PWM', BlockType.ActuatorPwm),
          drivenOutputId: bloxLink('Cool PWM', BlockType.ActuatorPwm, true),
        },
      },
      {
        id: 'Cool PWM',
        type: BlockType.ActuatorPwm,
        groups: [0],
        serviceId: 'test',
        data: {
          constrainedBy: {
            constraints: [{
              limiting: true,
              balanced: {
                balancerId: bloxLink('Balancer', BlockType.Balancer),
                granted: 10,
                id: 1,
              },
            }],
          },
          desiredSetting: 50,
          setting: 50,
          value: 50,
          actuatorId: bloxLink('Cool Actuator', BlockType.DigitalActuator),
          drivenActuatorId: bloxLink('Cool Actuator', BlockType.DigitalActuator, true),
          enabled: true,
          period: bloxQty('10s'),
        },
      },
      {
        id: 'Cool Actuator',
        type: BlockType.DigitalActuator,
        groups: [0],
        serviceId: 'test',
        data: {
          channel: 0,
          constrainedBy: {
            constraints: [{
              remaining: bloxQty('10m'),
              delayedOn: bloxQty('1h'),
            }],
          },
          desiredState: DigitalState.STATE_ACTIVE,
          state: DigitalState.STATE_ACTIVE,
          hwDevice: bloxLink('Spark Pins', BlockType.Spark3Pins, true),
          invert: false,
        },
      },
      {
        id: 'Spark Pins',
        type: BlockType.Spark3Pins,
        groups: [0],
        serviceId: 'test',
        data: {
          enableIoSupply12V: true,
          enableIoSupply5V: true,
          pins: [],
          soundAlarm: false,
          voltage12: 12,
          voltage5: 5,
        },
      },
    ];

  it('Should calculate drive chains', () => {
    expect(
      calculateDrivenChains(blocks)
        .sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1])),
    )
      .toEqual([
        ['Cool Actuator', 'Cool PWM', 'Cool PID'],
        ['Cool PWM', 'Cool PID'],
        ['Heat Actuator', 'Heat PWM', 'Heat PID'],
        ['Heat PWM', 'Heat PID'],
        ['Spark Pins', 'Cool Actuator', 'Cool PWM', 'Cool PID'],
        ['Spark Pins', 'Heat Actuator', 'Heat PWM', 'Heat PID'],
      ]);
  });

  it('Should calculate relations', () => {
    expect(
      calculateRelations(blocks)
        .sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target)),
    )
      .toEqual([
        { source: 'Cool Actuator', target: 'Spark Pins', relation: ['hwDevice'] },
        { source: 'Cool PID', target: 'Cool PWM', relation: ['outputId'] },
        {
          source: 'Cool PWM', target: 'Balancer',
          relation: ['constrainedBy', 'constraints', '0', 'balanced', 'balancerId'],
        },
        { source: 'Cool PWM', target: 'Cool Actuator', relation: ['actuatorId'] },
        { source: 'Heat Actuator', target: 'Spark Pins', relation: ['hwDevice'] },
        { source: 'Heat PID', target: 'Heat PWM', relation: ['outputId'] },
        { source: 'Heat PWM', target: 'Heat Actuator', relation: ['actuatorId'] },
        { source: 'Sensor', target: 'Setpoint', relation: ['sensorId'] },
        { source: 'Setpoint', target: 'Cool PID', relation: ['inputId'] },
        { source: 'Setpoint', target: 'Heat PID', relation: ['inputId'] },
      ]);
  });

  it('Should calculate limitations', () => {
    expect(
      calculateLimitations(blocks),
    )
      .toEqual([
        { id: 'Heat Actuator', limitedBy: [] },
        { id: 'Cool PWM', limitedBy: ['Balanced'] },
        { id: 'Cool Actuator', limitedBy: ['Delay ON (10m)'] },
      ]);
  });
});
