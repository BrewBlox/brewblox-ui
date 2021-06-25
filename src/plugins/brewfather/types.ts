import { Widget } from '@/store/widgets';

export type BrewfatherAutomationType =
  | 'MASH'
  | 'BOIL'
  | 'SPARGE'
  | 'FERMENTATION'

export type BrewfatherAutomationState =
  | 'HEAT'
  | 'REST'

export interface BrewfatherDevice {
  service_id: string;
  id: string;
}

export interface BrewfatherMashSettings {
  setpointDevice: BrewfatherDevice;
}

export interface BrewfatherSettings {
  mashAutomation: BrewfatherMashSettings;
}

export interface BrewfatherMashStep {
  stepTemp: number;
  rampTime: number | null;
  stepTime: number;
  type: 'Temperature';
  name: string;
  displayStepTemp: number;
}

export interface BrewfatherMash {
  _id: string;
  name: string;
  steps: BrewfatherMashStep[];
}

export interface BrewfatherCurrentState {
  automation_type: BrewfatherAutomationType;
  automation_state: BrewfatherAutomationState;
  step_index: number;
  step: BrewfatherMashStep | null;
  step_start_time: Date | string | number | null;
  step_end_time: Date | string | number | null;
}

export interface BrewfatherRecipe {
  id: string;
  name: string;
  [key: string]: any;
}

export interface BrewfatherStateEvent {
  key: string;
  data: {
    status_msg: string;
    state: BrewfatherCurrentState;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BrewfatherWidgetConfig { }

export type BrewfatherWidget = Widget<BrewfatherWidgetConfig>;
