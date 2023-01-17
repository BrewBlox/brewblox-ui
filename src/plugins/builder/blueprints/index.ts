import { BuilderBlueprint } from '@/plugins/builder/types';
import BeerBottle from './BeerBottle';
import BridgeTube from './BridgeTube';
import BuilderLabel from './BuilderLabel';
import Carboy from './Carboy';
import CheckValve from './CheckValve';
import Coil from './Coil';
import Condenser from './Condenser';
import Conical from './Conical';
import CounterflowChiller from './CounterflowChiller';
import CrossTube from './CrossTube';
import DipTube from './DipTube';
import ElbowTube from './ElbowTube';
import FilterBottom from './FilterBottom';
import Fridge from './Fridge';
import GraphDisplay from './GraphDisplay';
import GravityTube from './GravityTube';
import HeatingElement from './HeatingElement';
import ImageDisplay from './ImageDisplay';
import ImmersionCoil from './ImmersionCoil';
import Keg from './Keg';
import Kettle from './Kettle';
import Lauterhexe from './Lauterhexe';
import LValve from './LValve';
import MetricsDisplay from './MetricsDisplay';
import PidDisplay from './PidDisplay';
import ProfileDisplay from './ProfileDisplay';
import Pump from './Pump';
import PwmDisplay from './PwmDisplay';
import RimsTube from './RimsTube';
import SensorDisplay from './SensorDisplay';
import SessionLogDisplay from './SessionLogDisplay';
import SetpointDisplay from './SetpointDisplay';
import SetpointDriverDisplay from './SetpointDriverDisplay';
import ShiftedSystemIO from './ShiftedSystemIO';
import StraightInletTube from './StraightInletTube';
import StraightTube from './StraightTube';
import SystemIO from './SystemIO';
import TeeTube from './TeeTube';
import TiltDisplay from './TiltDisplay';
import UrlDisplay from './UrlDisplay';
import Valve from './Valve';
import WhirlpoolInlet from './WhirlpoolInlet';

const blueprints: { [key: string]: BuilderBlueprint } = {
  BeerBottle,
  BridgeTube,
  BuilderLabel,
  Carboy,
  CheckValve,
  Coil,
  Condenser,
  Conical,
  CounterflowChiller,
  CrossTube,
  DipTube,
  ElbowTube,
  FilterBottom,
  Fridge,
  GraphDisplay,
  GravityTube,
  HeatingElement,
  ImageDisplay,
  ImmersionCoil,
  Keg,
  Kettle,
  Lauterhexe,
  LValve,
  MetricsDisplay,
  PidDisplay,
  ProfileDisplay,
  Pump,
  PwmDisplay,
  RimsTube,
  SensorDisplay,
  SessionLogDisplay,
  SetpointDisplay,
  SetpointDriverDisplay,
  ShiftedSystemIO,
  StraightInletTube,
  StraightTube,
  SystemIO,
  TeeTube,
  TiltDisplay,
  UrlDisplay,
  Valve,
  WhirlpoolInlet,
};

export default blueprints;
