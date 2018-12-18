import { ActionContext } from 'vuex';
import { RootState } from '../state';

export interface Service {
  id: string;
  title: string;
  order: number;
  type: string;
  config: Object;
  _rev?: string;
}

export type ServiceState = {
  services: {
    [id: string]: Service;
  };
};

export type ServicesContext = ActionContext<ServiceState, RootState>;
