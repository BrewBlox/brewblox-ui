import queryString from 'query-string';

import { post } from '@/helpers/fetch';

import { convertToFlatPaths } from './measurementHelpers';
import { PlotlyData } from './state';

const api = process.env.VUE_APP_API_URI;

const metricsCache: { [key: string]: number[][]; } = {};

function toMicroSeconds(nanoseconds: number): number {
  return Math.floor(nanoseconds / 1000000);
}

function fetchData(serviceId: string, endpoint: string, payload: any = {}): Promise<any> {
  return post(`/${serviceId}${endpoint}`, { ...payload });
}

function metricsKey(serviceId: string, keys: string[]) {
  return queryString.stringify({
    keys,
    measurement: serviceId,
  });
}

function valuesFromCache(serviceId: string, keys: string[]) {
  const cacheKey = metricsKey(serviceId, keys);

  if (!metricsCache[cacheKey]) {
    return undefined;
  }

  return metricsCache[cacheKey];
}

function addValuesToCache(serviceId: string, keys: string[], values: number[][]) {
  const cacheKey = metricsKey(serviceId, keys);

  if (!metricsCache[cacheKey]) {
    metricsCache[cacheKey] = [];
  }

  const currentTimeStamps = [...metricsCache[cacheKey].map(item => item[0])];

  metricsCache[cacheKey] = [
    ...metricsCache[cacheKey],
    // only add if timestamp is not found yet
    ...values.filter(item => currentTimeStamps.indexOf(item[0]) === -1),
  ];

  return metricsCache[cacheKey];
}

export function getAvailableMeasurements(serviceId: string): Promise<string[]> {
  return fetchData(serviceId, '/query/objects')
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

  const cached = valuesFromCache(serviceId, keys);

  if (cached) {
    return Promise.resolve(toPlotlyData(cached, keys));
  }

  return fetchData('/query/values', payload)
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
    new EventSource(`${api}/${serviceId}/sse/values?${queryString.stringify(options)}`);

  eventSource.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const values = addValuesToCache(serviceId, keys, data.values);

    if (onUpdate && typeof onUpdate === 'function') {
      onUpdate(toPlotlyData(values, keys));
    }
  };

  return eventSource;
}
