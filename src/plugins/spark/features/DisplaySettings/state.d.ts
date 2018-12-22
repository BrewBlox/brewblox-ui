import { Block } from '@/plugins/spark/state';
import { Link } from '@/helpers/units';

export interface DisplayWidget {
  pos: number;
  color: string;
  name: string;

  // Value will be one of these
  tempSensor?: Link;
  setpointSensorPair?: Link;
  actuatorAnalog?: Link;
  pid?: Link;
}

export interface DisplaySettingsBlock extends Block {
  data: {
    name: string;
    widgets: DisplayWidget[];
  };
}
