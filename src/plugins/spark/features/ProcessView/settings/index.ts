import BridgeTube from './BridgeTube';
import Coil from './Coil';
import ElbowTube from './ElbowTube';
import InputTube from './InputTube';
import Kettle from './Kettle';
import OutputTube from './OutputTube';
import Pump from './Pump';
import StraightTube from './StraightTube';
import TeeTube from './TeeTube';
import Valve from './Valve';

import { ComponentSettings } from '../state';

const settings: { [key: string]: ComponentSettings } = {
  BridgeTube,
  Coil,
  ElbowTube,
  InputTube,
  Kettle,
  OutputTube,
  Pump,
  StraightTube,
  TeeTube,
  Valve,
};

export default settings;
