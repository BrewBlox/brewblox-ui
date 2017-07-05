import axios from 'axios';

const initialState = {
  chartData: [],
};

/**
 * Converts BrewPi data to BrewBlox data format
 **/
const convertLegacyJson = (data) => {
  const typeConversion = { datetime: 'category', number: 'line' };
  const newData = data.cols.map(s => ({ name: s.label, type: typeConversion[s.type], animation: false, data: [] }));
  data.rows.forEach((r, i) => {
    r.c.forEach((c, j) => {
      if (j === 0) {
        // const date = Date((c.v.replace('Date(', '').replace(')', '')));
        const date = Date.now() + (j * 10000); // parse(c.v.replace('Date(', '').replace(')', ''));  // eslint-disable-line
        console.log(date);
        newData[j].data.push(date);
        // newData[j].data.push(i); // eslint-disable-line
      }
      else {
        newData[j].data.push((c !== null ? c.v : undefined));
      }
    });
  });
  return newData;
};

const mutations = {
  DATA_RECEIVED: (state, payload) => {
    state.chartData = convertLegacyJson(payload);
  },
};

const actions = {
  FETCH_DATA: ({ commit }, payload) => {
    axios.get(`statics/${payload.name}.json`)
    .then((response) => {
      commit('DATA_RECEIVED', response.data);
    })
    .catch((e) => {
      console.error(e); // eslint-disable-line
    });
  },
};
const getters = {
  chartData: (state) => state.chartData,
  plottedData: (state) => {
    if (state.chartData.length > 0) {
      const series = state.chartData.map((s) => {
        // only keep 1000 data points
        const sparse = Object.assign({}, s);
        const skip = Math.floor(sparse.data.length / 1000);
        sparse.data = sparse.data.filter((e, i) => i % skip === 0);
        return sparse;
      });
      return { timeData: series[0], series: series.slice(1).filter((s) => s.type !== undefined) };
    }
    return { timeData: [], series: [] };
  },
};

const module = {
  namespaced: true,
  state: initialState,
  mutations,
  actions,
  getters,
};

export default module;
