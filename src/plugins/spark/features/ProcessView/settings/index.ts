import BridgeTube from './BridgeTube';
import CheckValve from './CheckValve';
import Coil from './Coil';
import CounterflowChiller from './CounterflowChiller';
import CrossTube from './CrossTube';
import DipTube from './DipTube';
import ElbowTube from './ElbowTube';
import HeatingElement from './HeatingElement';
import ImmersionCoil from './ImmersionCoil';
import Kettle from './Kettle';
import LargeKettle from './LargeKettle';
import Lauterhexe from './Lauterhexe';
import Pump from './Pump';
import SmallKettle from './SmallKettle';
import SensorDisplay from './SensorDisplay';
import StraightInletTube from './StraightInletTube';
import StraightTube from './StraightTube';
import SystemIO from './SystemIO';
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
  Kettle,
  LargeKettle,
  Lauterhexe,
  Pump,
  SensorDisplay,
  SmallKettle,
  StraightInletTube,
  StraightTube,
  SystemIO,
  TeeTube,
  Valve,
  WhirlpoolInlet,
};

export default settings;
