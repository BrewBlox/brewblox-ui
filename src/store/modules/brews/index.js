import axios from 'axios';

const initialState = {
  names: [],
  data: {},
};

/**
 * Converts BrewPi data to BrewBlox data format
 * */
const convertLegacyJson = (data) => {
  const typeConvert = (name, type) => {
    if (name === 'State') {
      return 'state';
    }
    return { datetime: 'category', number: 'line' }[type];
  };
  const newData = data.cols.map(s => ({
    name: s.label,
    type: typeConvert(s.label, s.type),
    data: [],
  }));
  const timeIndex = 0;
  // const stateIndex = newData.findIndex(e => 'State'.localeCompare(e.name) === 0);
  data.rows.forEach((r) => {
    r.c.forEach((c, j) => {
      if (j === timeIndex) {
        const date = eval('new '+ c.v); // eslint-disable-line
        // const date = Date.now() + (j * 10000); // parse(c.v.replace('Date(', '').replace(')', ''));  // eslint-disable-line
        newData[j].data.push(date.toISOString());
      }
      else {
        newData[j].data.push((c !== null ? c.v : undefined));
      }
    });
  }, this);
  return newData;
};

const mutations = {
  DATA_RECEIVED: (state, payload) => {
    state.data[payload.name] = convertLegacyJson(payload.data);
    state.names.push(payload.name);
  },
};

const actions = {
  FETCH_DATA: ({ commit }, payload) => {
    axios.get(`statics/${payload.name}.json`)
      .then((response) => {
        commit('DATA_RECEIVED', { name: payload.name, data: response.data });
      })
      .catch((e) => {
      console.error(e); // eslint-disable-line
      });
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
