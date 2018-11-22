import { Link, Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

export interface PidBlock extends Block {
  data: {
    inputId: Link;
    outputId: Link;

    inputValid: boolean;
    outputValid: boolean;

    inputValue: Unit;
    inputSetting: Unit;
    outputValue: number;
    outputSetting: number;

    filter: number;
    filterThreshold: Unit;

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
  };
}
