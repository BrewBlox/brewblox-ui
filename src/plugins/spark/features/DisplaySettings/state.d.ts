import { Block } from '@/plugins/spark/state';
import { Link } from '@/helpers/units';

export interface DisplayWidget {
  pos: number;
  color: string;
  name: string;

  // Value will be one of these
  TempSensor?: Link;
  SetpointSensorPair?: Link;
  ActuatorPwm?: Link;
  ActuatorAnalog?: Link;
  Pid?: Link;
}

export interface DisplaySettingsBlock extends Block {
  data: {
    name: string;
    widgets: DisplayWidget[];
  };
}
