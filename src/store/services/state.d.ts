import { ActionContext } from 'vuex';

import { State as RootState } from '../state';

interface Service {
  id: string;
  type: 'spark' | 'misc';
}

export type ServicesState = {
  allIds: string[],
  byId: {
    [id: string]: Service;
  },
  fetching: boolean,
};

export type ServicesContext = ActionContext<ServicesState, RootState>;
