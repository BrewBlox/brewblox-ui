import { Block } from '@/services/Spark/state';
import Link from '@/helpers/units/Link';
import { Unit } from '@/helpers/units';


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

    filter: string;
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
