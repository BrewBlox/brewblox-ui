import { BlockBase } from '@/plugins/spark/types';
import { Link, Unit } from '@/plugins/spark/units';

export interface PidData {
  inputId: Link;
  outputId: Link;

  inputValue: Unit;
  inputSetting: Unit;
  outputValue: number;
  outputSetting: number;

  enabled: boolean;
  active: boolean;

  kp: Unit;
  ti: Unit;
  td: Unit;

  p: number;
  i: number;
  d: number;

  error: Unit;
  integral: Unit;
  derivative: Unit;

  drivenOutputId: Link;
  integralReset: number;

  boilPointAdjust: Unit;
  boilMinOutput: number;
  boilModeActive: boolean;
}

export interface PidBlock extends BlockBase {
  type: 'Pid';
  data: PidData;
}
