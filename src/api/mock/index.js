import views from './grid/views';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// This sets the mock adapter on the default instance
const normalAxios = axios.create();
const mockAxios = axios.create();
const mock = new MockAdapter(mockAxios);

// Mock GET request to /grids
mock.onGet('/grids').reply((config) => [200, Object.keys(views)]);

// Mock GET request to /grids/name
const gridNameRegex = /\/grids\/([^/]+)/;
mock.onGet(gridNameRegex).reply((config) => {
  const match = gridNameRegex.exec(config.url);
  const name = match[1];
  const view = views[name];
  if (view !== undefined) {
    return [200, view];
  }
  return [404];
});

export default mockAxios;
