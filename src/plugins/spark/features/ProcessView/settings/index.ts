import BridgeTube from './BridgeTube';
import ElbowTube from './ElbowTube';
import InputTube from './InputTube';
import OutputTube from './OutputTube';
import Pump from './Pump';
import StraightTube from './StraightTube';
import TeeTube from './TeeTube';
import Valve from './Valve';

import { ComponentSettings } from '../state';

const settings: { [key: string]: ComponentSettings } = {
  BridgeTube,
  ElbowTube,
  InputTube,
  OutputTube,
  Pump,
  StraightTube,
  TeeTube,
  Valve,
};

export default settings;
