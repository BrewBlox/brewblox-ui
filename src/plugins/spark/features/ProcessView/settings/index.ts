import BridgeTube from './BridgeTube';
import CheckValve from './CheckValve';
import Coil from './Coil';
import CounterflowChiller from './CounterflowChiller';
import CrossTube from './CrossTube';
import DipTube from './DipTube';
import ElbowTube from './ElbowTube';
import HeatingElement from './HeatingElement';
import ImmersionCoil from './ImmersionCoil';
import InputTube from './InputTube';
import Kettle from './Kettle';
import Lauterhexe from './Lauterhexe';
import OutputTube from './OutputTube';
import Pump from './Pump';
import StraightInletTube from './StraightInletTube';
import StraightTube from './StraightTube';
import TeeTube from './TeeTube';
import Valve from './Valve';
import WhirlpoolInlet from './WhirlpoolInlet';

import { ComponentSettings } from '../state';

const settings: { [key: string]: ComponentSettings } = {
  BridgeTube,
  CheckValve,
  Coil,
  CounterflowChiller,
  CrossTube,
  DipTube,
  ElbowTube,
  HeatingElement,
  ImmersionCoil,
  InputTube,
  Kettle,
  Lauterhexe,
  OutputTube,
  Pump,
  StraightInletTube,
  StraightTube,
  TeeTube,
  Valve,
  WhirlpoolInlet,
};

export default settings;
