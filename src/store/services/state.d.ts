import { ActionContext } from 'vuex';
import { RootState } from '../state';

export interface Service {
  id: string;
  title: string;
  order: number;
  type: string;
  config: Record<string, any>;
  _rev?: string;
}

export interface ServiceState {
  replicating: boolean;
  services: {
    [id: string]: Service;
  };
}

export type ServicesContext = ActionContext<ServiceState, RootState>;
