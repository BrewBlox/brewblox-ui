import queryString from 'query-string';

import { convertToFlatPaths } from './measurementHelpers';

const historyService = 'http://localhost/history';

// docker run --rm -d --network=host brewblox/area51:replay --measurement=pressure
// docker run --rm -d --network=host brewblox/area51:replay --measurement=glitter

function toMicroSeconds(nanoseconds: number): number {
  return Math.floor(nanoseconds / 1000000);
}

function fetchData(endpoint: string, payload: any = {}): Promise<Response> {
  return window.fetch(
    `${historyService}${endpoint}`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    },
  );
}

function metricsKey(serviceId: string, keys: string[]) {
  return queryString.stringify({
    keys,
    measurement: serviceId,
  });
}

export function getAvailableMeasurements(): Promise<string[]> {
  return fetchData('/query/objects')
    .then(response => response.json())
    .then(convertToFlatPaths);
}

export function getMetric(
  serviceId: string,
  keys: string[],
  options: any = {},
): Promise<PlotlyData[]> {
  const payload = {
    keys: ['time', ...keys],
    measurement: serviceId,
    ...options,
  };

  // const key = metricsKey(serviceId, keys);

  return fetchData('/query/values', payload)
    .then(response => response.json())
    .then((response) => {
      // safe result in metrics

      if (!response.values) {
        throw new Error('No results found');
      }

      const x = response.values.map(([time]: number[]) => toMicroSeconds(time));

      return keys.map((key, index) => ({
        x,
        type: 'scatter',
        y: response.values.map((item: number[]) => item[index + 1]),
        name: key,
      }));
    });
}


export function subscribeToEvents(serviceId: string, keys: string[]) {
  const options = {
    keys: ['time', ...keys],
    measurement: serviceId,
  };

  // const key = metricsKey(serviceId, keys);

  const eventSource =
    new EventSource(`${historyService}/sse/values?${queryString.stringify(options)}`);

  // listen to updates from eventSource
  // update data based on 'key'

  return eventSource;
}
