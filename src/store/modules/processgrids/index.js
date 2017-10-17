import api from 'axios';

const initialGridState = {
  layouts: [],
  id: -1,
  name: '',
  steps: [],
  showCoordinates: true,
  showGridLines: true,
  height: 10,
  width: 10,
};

const initialState = {
  '-1': initialGridState,
};

const mutations = {
  FETCH_PROCESS_SUCCESS: (state, payload) => {
    if (payload.id !== undefined) {
      state[payload.id] = payload.data;
    }
  },
  FETCH_PROCESS_ERROR: (state, payload) => {
    if (payload.error !== undefined) {
      state[payload.error] = payload.error;
    }
  },
};

const actions = {
  fetchProcessGrid(context, data) {
    return api.post(data.url, data.request)
      .then((response) => context.commit('FETCH_PROCESS_SUCCESS', response))
      .catch((error) => context.commit('FETCH_PROCESS_ERROR', error));
  },
};

const getters = {
  names: (state) => state.names,
  data: (state) => state.data,
  getByName: (state, _getters) => (name) => _getters.data.find((dataset) => dataset.name === name),
  /* getSparseByName: (state, _getters) => {
    const data = _getters.getByName(name);
    if (data.length > 0) {
      const series = data.map((s) => {
        // only keep 1000 data points
        const sparse = Object.assign({}, s);
        const skip = Math.floor(sparse.data.length / 1000);
        sparse.data = sparse.data.filter((e, i) => i % skip === 0);
        return sparse;
      });
      return series.filter((s) => s.type !== undefined);
    }
    return [[0], [0]];
  }, */
};

const module = {
  namespaced: true,
  state: initialState,
  mutations,
  actions,
  getters,
};

export default module;
