import queryString from 'query-string';

import { convertToFlatPaths } from './measurementHelpers';

const historyService = 'http://localhost/history';

const metricsCache: { [key: string]: number[][]; } = {};

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

function addValuesToCache(serviceId: string, keys: string[], values: number[][]) {
  const cacheKey = metricsKey(serviceId, keys);

  if (!metricsCache[cacheKey]) {
    metricsCache[cacheKey] = [];
  }

  metricsCache[cacheKey] = [...metricsCache[cacheKey], ...values];

  return metricsCache[cacheKey];
}

export function getAvailableMeasurements(): Promise<string[]> {
  return fetchData('/query/objects')
    .then(response => response.json())
    .then(convertToFlatPaths);
}

function toPlotlyData(values: number[][], keys: string[]) {
  const x = values.map(([time]: number[]) => toMicroSeconds(time));

  return keys.map((key, index) => ({
    x,
    type: 'scatter',
    y: values.map((item: number[]) => item[index + 1]),
    name: key,
  }));
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

      const values = addValuesToCache(serviceId, keys, response.values);
      return toPlotlyData(values, keys);
    });
}


export function subscribeToEvents(
  serviceId: string,
  keys: string[],
  onUpdate: (data: PlotlyData[]) => void,
): EventSource {
  const options = {
    keys: ['time', ...keys],
    measurement: serviceId,
  };

  const eventSource =
    new EventSource(`${historyService}/sse/values?${queryString.stringify(options)}`);

  eventSource.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const values = addValuesToCache(serviceId, keys, data.values);

    if (onUpdate && typeof onUpdate === 'function') {
      onUpdate(toPlotlyData(values, keys));
    }
  };

  return eventSource;
}
