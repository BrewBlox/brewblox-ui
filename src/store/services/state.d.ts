import { ActionContext } from 'vuex';

import { State as RootState } from '../state';

export interface Service {
  id: string;
  title: string;
  order: number;
  type: string;
  config: Object;
  isLoading?: boolean;
}

export type ServicesState = {
  services: {
    [id: string]: Service;
  },
  fetching: boolean,
};

export type ServicesContext = ActionContext<ServicesState, RootState>;
