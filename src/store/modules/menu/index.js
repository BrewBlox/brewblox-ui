// menu module, containts default items.
// aditional items are received from the API

import axios from 'axios';

const ENDPOINT = 'api/ui/menu';

const initialState = {
  items: [
    {
      type: 'header',
      label: 'Fetching menu...',
    },
  ],
};

const mutations = {
  FETCH_SUCCESS: (state, payload) => {
    state.items = payload.data;
  },
  FETCH_ERROR: (state, payload) => {
    state.error = payload.error;
  },
};

const actions = {
  fetch: ({ commit }) => {
    axios.get(ENDPOINT)
      .then((response) => {
        commit('FETCH_SUCCESS', { data: response.data });
      })
      .catch((e) => {
        commit('FETCH_ERROR', { error: e });
        console.error(e); // eslint-disable-line
      });
  },
};

const getters = {
  items: (state) => state.items,
};

const module = {
  namespaced: true,
  state: initialState,
  mutations,
  actions,
  getters,
};

export default module;
