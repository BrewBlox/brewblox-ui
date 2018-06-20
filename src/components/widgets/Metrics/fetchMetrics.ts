import queryString from 'query-string';

import { convertToFlatPaths } from './measurementHelpers';

const historyService = 'http://192.168.0.65/history';

// ssh pi@192.168.0.65
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

  return fetchData('/query/values', payload)
    .then(response => response.json())
    .then((response) => {
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

  return new EventSource(`${historyService}/sse/values?${queryString.stringify(options)}`);
}
