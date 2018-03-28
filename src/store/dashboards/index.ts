const getters = {};
const actions = {};
const mutations = {};

const dashboards = {
  getters,
  actions,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    dashboards: {
      allIds: [],
      byId: {},
    },
    items: {
      allIds: [],
      byId: {},
    },
  },
};

export default dashboards;
