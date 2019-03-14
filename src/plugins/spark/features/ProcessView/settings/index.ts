import BridgeTube from './BridgeTube';
import CheckValve from './CheckValve';
import Coil from './Coil';
import CounterflowChiller from './CounterflowChiller';
import CrossTube from './CrossTube';
import ElbowTube from './ElbowTube';
import ImmersionCoil from './ImmersionCoil';
import InputTube from './InputTube';
import Kettle from './Kettle';
import Lauterhexe from './Lauterhexe';
import OutputTube from './OutputTube';
import Pump from './Pump';
import StraightTube from './StraightTube';
import TeeTube from './TeeTube';
import Valve from './Valve';

import { ComponentSettings } from '../state';

const settings: { [key: string]: ComponentSettings } = {
  BridgeTube,
  CheckValve,
  Coil,
  CounterflowChiller,
  CrossTube,
  ElbowTube,
  ImmersionCoil,
  InputTube,
  Kettle,
  Lauterhexe,
  OutputTube,
  Pump,
  StraightTube,
  TeeTube,
  Valve,
};

export default settings;
