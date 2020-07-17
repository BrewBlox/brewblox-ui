import fromEntries from 'fromentries';
import forEach from 'lodash/forEach';
import zip from 'lodash/zip';
import parseDuration from 'parse-duration';

import { historyStore } from '@/plugins/history/store';
import {
  GraphSource,
  QueryParams,
  QueryResult,
  QueryTarget,
} from '@/plugins/history/types';

const MAX_POINTS = 5000;

interface ProcessParams {
  offsetSlope: number;
  offset: number;
  gain: number;
  common0: number;
  p0: number;
}

interface SharedParams {
  heightDiff: number; // mm between sensors
  countsPerMillivolt: number;
  countsPerMillivoltDiff: number;
  calibrationDensity: number; // water at 20C in g/L
  barPerMeter: number;
}

interface RawData {
  time: number[];
  A1: number[];
  A2: number[];
  B1: number[];
  B2: number[];
  A1f: number[];
  A2f: number[];
  B1f: number[];
  B2f: number[];
  brA1p: number[];
  brA1n: number[];
  brA2p: number[];
  brA2n: number[];
  brB1p: number[];
  brB1n: number[];
  brB2p: number[];
  brB2n: number[];
  temp1: number[];
  temp2: number[];
  baro: number[];
  temp: number[];
}

interface ProcessedData extends RawData {
  commonA1: number[];
  commonA2: number[];
  signalA1: number[];
  signalA2: number[];
  pBaro: number[];
  tempBaro: number[];
  'pressure1[mBar]': number[];
  'pressure2[mBar]': number[];
  'pressure1[mmH20]': number[];
  'pressure2[mmH20]': number[];
  'pressureDiff[mBar]': number[];
  'pressureDiff[mmH20]': number[];
  density: number[];
  mmLiquid1: number[];
  mmLiquid2: number[];
}

const transpose = (matrix: any[][]): any[][] => matrix[0].map((_, idx) => matrix.map(row => row[idx]));

const boundedConcat =
  (left: number[] = [], right: number[] = [], maxLength: number = MAX_POINTS): number[] => {
    const sliced = Math.max((left.length + right.length) - maxLength, 0);
    if (sliced > left.length) {
      return right.slice(sliced - left.length);
    }
    if (sliced > 0) {
      const result = left.slice(sliced);
      result.push(...right);
      return result;
    }
    return [...left, ...right];
  };

const valueName =
  (source: GraphSource, key: string): string => {
    const label = source.renames[key] || key;
    return source.axes[key] === 'y2'
      ? `<span style="color: #aef">${label}</span>`
      : `<span>${label}</span>`;
  };

const densityTarget: QueryTarget = {
  measurement: 'vasi-raw',
  fields: [
    'A1',
    'A2',
    'B1',
    'B2',
    'A1f',
    'A2f',
    'B1f',
    'B2f',
    'brA1p',
    'brA1n',
    'brA2p',
    'brA2n',
    'brB1p',
    'brB1n',
    'brB2p',
    'brB2n',
    'temp1',
    'temp2',
    'baro',
    'temp',
  ],
};

const params1: ProcessParams = {
  offsetSlope: 0.00405995,
  offset: -0.34661097,
  gain: 0.04101200,
  common0: 1005.03808,
  p0: 0.40292559,
};

const params2: ProcessParams = {
  offsetSlope: 0.00418442,
  offset: -0.29365503,
  gain: 0.04118308,
  common0: 1012.96322,
  p0: 0.38371216,
};

const sharedParams: SharedParams = {
  heightDiff: 292,
  countsPerMillivolt: 2 ** 23 / 1350,
  countsPerMillivoltDiff: 2 ** 23 / 1350 * 32,
  calibrationDensity: 998.2,
  barPerMeter: 0.09806,
};

const calcTemp = (raw: number[]): number[] => {
  return raw.map(v => {
    const uVolts = 0.298023224 * v;
    const tempC = 25.0 + ((uVolts - 122400.0) / 420.0);
    return tempC;
  });
};

const calcOffset = (params: ProcessParams, common: number[]): number[] =>
  common
    .map(v =>
      params.offset * (1 + params.offsetSlope) * (v - params.common0) + params.gain * params.p0);


const calcPressure = (params: ProcessParams, signal: number[], common: number[]): number[] =>
  zip(signal, calcOffset(params, common))
    .map(([signalV, offsetV]) =>
      (signalV! - offsetV!) / params.gain + params.p0);


const transformer =
  (source: GraphSource, result: QueryResult): GraphSource => {
    if (!result.values || result.values.length === 0) {
      return source; // no-op
    }

    const resultCols = transpose(result.values);
    source.usedPolicy = result.policy;

    const raw: RawData = fromEntries(zip(result.columns, resultCols));

    const commonA1 = zip(raw.brA1n, raw.brA1p).map(([n, p]) => 0.5 * (n! + p!) / sharedParams.countsPerMillivolt);
    const commonA2 = zip(raw.brA2n, raw.brA2p).map(([n, p]) => 0.5 * (n! + p!) / sharedParams.countsPerMillivolt);
    const signalA1 = raw.A1f.map(v => v / sharedParams.countsPerMillivoltDiff);
    const signalA2 = raw.A2f.map(v => v / sharedParams.countsPerMillivoltDiff);
    const pBaro = raw.baro.map(v => v / 100);
    const temp1 = calcTemp(raw.temp1);
    const temp2 = calcTemp(raw.temp2);
    const tempBaro = raw.temp.map(v => v / 10);
    const pressure1mBar = calcPressure(params1, signalA1, commonA1);
    const pressure2mBar = calcPressure(params2, signalA2, commonA2);
    const pressure1mmH20 = pressure1mBar.map(v => v / sharedParams.barPerMeter);
    const pressure2mmH20 = pressure2mBar.map(v => v / sharedParams.barPerMeter);
    const pressureDiffmBar = zip(pressure1mBar, pressure2mBar).map(([v1, v2]) => v1! - v2!);
    const pressureDiffmmH20 = zip(pressure1mmH20, pressure2mmH20).map(([v1, v2]) => v1! - v2!);
    const density = pressureDiffmmH20.map(v => v / sharedParams.heightDiff);
    const mmLiquid1 = zip(pressure1mmH20, density).map(([p, d]) => p! / d!);
    const mmLiquid2 = zip(pressure2mmH20, density).map(([p, d]) => p! / d!);

    const processed: ProcessedData = {
      ...raw,
      commonA1,
      commonA2,
      signalA1,
      signalA2,
      pBaro,
      temp1,
      temp2,
      tempBaro,
      'pressure1[mBar]': pressure1mBar,
      'pressure2[mBar]': pressure2mBar,
      'pressure1[mmH20]': pressure1mmH20,
      'pressure2[mmH20]': pressure2mmH20,
      'pressureDiff[mBar]': pressureDiffmBar,
      'pressureDiff[mmH20]': pressureDiffmmH20,
      density,
      mmLiquid1,
      mmLiquid2,
    };

    forEach(processed, (newValues: number[], colKey: string) => {
      if (colKey === 'time') {
        return;
      }
      const key = `${result.name}/${colKey}`;
      const existing = source.values[key] ?? {};
      source.values[key] = {
        type: 'scatter',
        ...existing,
        name: valueName(source, key),
        yaxis: colKey.startsWith('br') ? 'y2' : 'y', // rough approach
        line: {},
        x: boundedConcat(existing.x, processed.time),
        y: boundedConcat(existing.y, newValues),
      };
    });

    if (
      source.params.duration
      && !source.params.start
      && !source.params.end
    ) {
      // timestamp in Ms that should be discarded
      const boundary = new Date().getTime() - parseDuration(source.params.duration);
      forEach(source.values, val => {
        const boundaryIdx = val.x.findIndex((x: number) => x > boundary);
        if (boundaryIdx > 0) {
          val.x = val.x.slice(boundaryIdx);
          val.y = val.y.slice(boundaryIdx);
        }
      });
    }
    return source;
  };


export async function addDensitySource(id: string, params: QueryParams): Promise<void> {
  const source: GraphSource = {
    id,
    params,
    renames: {},
    axes: {},
    colors: {},
    transformer,
    target: densityTarget,
    values: {},
  };
  await historyStore.addValuesSource(source);
}
