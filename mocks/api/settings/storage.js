let storage = {};

module.exports = {
  storage,
  getData() {
    return storage;
  },
  updateData(data) {
    storage = data;
  },
};
