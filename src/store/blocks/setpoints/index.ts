import { BlocksContext } from '../';
import { SetPoint, SetPointsState } from './state';

interface SetPointAction extends SetPoint {
  type: 'setpoint',
}

export const setpoints = {
  state: {},
  mutations: {
    addBlock(state: SetPointsState, { id, type, value }: SetPointAction) {
      if (type === 'setpoint') {
        state[id] = { id, value };
      }
    },
  },
  actions: {
    addSetpoint({ commit }: BlocksContext, { id, value }: any) {
      commit('addBlock', { id, type: 'setpoint', value });
    },
  },
};
