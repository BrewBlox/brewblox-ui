import { ActionContext } from 'vuex';

import { State as RootState } from '../state';

export interface Service {
  id: string;
  type: 'HistoryService' | 'DeviceService';
}

export interface DeviceService extends Service {
  type: 'DeviceService';
}

export type ServicesState = {
  services: {
    [id: string]: Service;
  },
  fetching: boolean,
};

export type ServicesContext = ActionContext<ServicesState, RootState>;
