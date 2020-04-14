import { PartSpec } from '../types';
import ActuatorValve from './ActuatorValve';
import BeerBottle from './BeerBottle';
import BridgeTube from './BridgeTube';
import BuilderLabel from './BuilderLabel';
import Carboy from './Carboy';
import CheckValve from './CheckValve';
import Coil from './Coil';
import Conical from './Conical';
import CounterflowChiller from './CounterflowChiller';
import CrossTube from './CrossTube';
import DipTube from './DipTube';
import ElbowTube from './ElbowTube';
import FilterBottom from './FilterBottom';
import Fridge from './Fridge';
import GravityTube from './GravityTube';
import HeatingElement from './HeatingElement';
import ImmersionCoil from './ImmersionCoil';
import Keg from './Keg';
import Kettle from './Kettle';
import Lauterhexe from './Lauterhexe';
import LValve from './LValve';
import PidDisplay from './PidDisplay';
import ProfileDisplay from './ProfileDisplay';
import Pump from './Pump';
import PwmDisplay from './PwmDisplay';
import PwmPump from './PwmPump';
import RimsTube from './RimsTube';
import SensorDisplay from './SensorDisplay';
import SessionLogDisplay from './SessionLogDisplay';
import SetpointDisplay from './SetpointDisplay';
import ShiftedSystemIO from './ShiftedSystemIO';
import StraightInletTube from './StraightInletTube';
import StraightTube from './StraightTube';
import SystemIO from './SystemIO';
import TeeTube from './TeeTube';
import UrlDisplay from './UrlDisplay';
import Valve from './Valve';
import WhirlpoolInlet from './WhirlpoolInlet';

const specs: { [key: string]: PartSpec } = {
  ActuatorValve,
  BeerBottle,
  BridgeTube,
  BuilderLabel,
  Carboy,
  CheckValve,
  Coil,
  Conical,
  CounterflowChiller,
  CrossTube,
  DipTube,
  ElbowTube,
  FilterBottom,
  GravityTube,
  HeatingElement,
  ImmersionCoil,
  Keg,
  Kettle,
  Lauterhexe,
  LValve,
  PidDisplay,
  ProfileDisplay,
  Pump,
  PwmDisplay,
  PwmPump,
  RimsTube,
  SensorDisplay,
  SessionLogDisplay,
  SetpointDisplay,
  ShiftedSystemIO,
  StraightInletTube,
  StraightTube,
  SystemIO,
  Fridge,
  TeeTube,
  UrlDisplay,
  Valve,
  WhirlpoolInlet,
};

export default specs;
