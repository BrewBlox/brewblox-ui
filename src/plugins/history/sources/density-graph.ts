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
  s0: number;
  rpb: number;
  rpt: number;
  rnb: number;
  rnt: number;
  ds: number;
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
  A1pb: number[];
  A1pt: number[];
  A1nb: number[];
  A1nt: number[];
  A2pb: number[];
  A2pt: number[];
  A2nb: number[];
  A2nt: number[];
  temp1: number[];
  temp2: number[];
  baro: number[];
  temp: number[];
}

interface SensorMeasurement {
  vpb: number[];
  vpt: number[];
  vnb: number[];
  vnt: number[];
  signal: number[];
}

interface ProcessedData {
  time: number[];
  rawA1: number[];
  rawA2: number[];
  A1: number[];
  A2: number[];
  pBaro: number[];
  tempBaro: number[];

  temp1: number[];

  temp2: number[];
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
    // 'B1',
    // 'B2',
    'A1f',
    'A2f',
    // 'B1f',
    // 'B2f',
    'A1pb',
    'A1pt',
    'A1nb',
    'A1nt',
    'A2pb',
    'A2pt',
    'A2nb',
    'A2nt',
    // 'B1pb',
    // 'B1pt',
    // 'B1nb',
    // 'B1nt',
    // 'B2pb',
    // 'B2pt',
    // 'B2nb',
    // 'B2nt',
    // 'brB2n',
    'temp1',
    'temp2',
    'baro',
    'temp'],
};


const params1: ProcessParams = {
  s0: 0.04101136,
  rpb: 3987.08527,
  rpt: 3993.25993,
  rnb: 3993.25993,
  rnt: 3987.08528,
  ds: -9.5654e-4,
  p0: 30.1552305,
};

const params2: ProcessParams = {
  s0: 0.04111799,
  rpb: 3978.78268,
  rpt: 3984.15243,
  rnb: 3984.15243,
  rnt: 3978.78268,
  ds: -9.5898e-04,
  p0: 26.8317991,
};

const sharedParams: SharedParams = {
  heightDiff: 292,
  countsPerMillivolt: 2 ** 23 / 1350,
  countsPerMillivoltDiff: 32 * 2 ** 23 / 1350,
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


const par = (R1: number, R2: number): number => R1 * R2 / (R1 + R2);

const calcOffset = (params: ProcessParams, measured: SensorMeasurement): number[] => {
  const vp = zip(measured.vpb, measured.vpt).map(([a, b]) => a + b);
  const vn = zip(measured.vnb, measured.vnt).map(([a, b]) => a + b);
  const vb = zip(measured.vpb, measured.vnb).map(([a, b]) => (a + b) / 2);
  const vt = zip(measured.vpt, measured.vnt).map(([a, b]) => (a + b) / 2);
  const v = zip(vp, vn).map(([a, b]) => (a + b) / 2);

  const v0 = 0.25 * par(params.rpb + params.rpt, params.rnb + params.rnt);
  const gainb = vb.map(vb_ => params.s0 * (1 + params.ds * (vb_ - v0)) / 1000);
  const gaint = vt.map(vt_ => params.s0 * (1 + params.ds * (vt_ - v0)) / 1000);

  const calcR = (v: number[], gain: number[], r0: number): number[] => zip(v, gain).map(([v, gain]) =>
    v / v0 * r0 * (1 + gain / 2 * params.p0));

  const rpb = calcR(vb, gainb, params.rpb);
  const rnb = calcR(vb, gainb, params.rnb);
  const rpt = calcR(vt, gaint, params.rpt);
  const rnt = calcR(vt, gaint, params.rnt);

  const i_p = zip(v, rpb, rpt).map(([v, p, t]) => v / (p + t));
  const i_n = zip(v, rnb, rnt).map(([v, p, t]) => v / (p + t));

  return zip(i_p, i_n, rpb, rpt, rnb, rnt).map(([i_p, i_n, rpb, rpt, rnb, rnt]) =>
    (i_p * rpb - i_n * rnb + i_n * rnt - i_p * rpt) / 2);

};

const processRawA1 = (raw: RawData): SensorMeasurement =>
  ({
    vpb: raw.A1pb.map(v => v / sharedParams.countsPerMillivolt),
    vpt: raw.A1pt.map(v => v / sharedParams.countsPerMillivolt),
    vnb: raw.A1nb.map(v => v / sharedParams.countsPerMillivolt),
    vnt: raw.A1nt.map(v => v / sharedParams.countsPerMillivolt),
    signal: raw.A1.map(v => v / sharedParams.countsPerMillivoltDiff),
  });

const processRawA2 = (raw: RawData): SensorMeasurement =>
  ({
    vpb: raw.A2pb.map(v => v / sharedParams.countsPerMillivolt),
    vpt: raw.A2pt.map(v => v / sharedParams.countsPerMillivolt),
    vnb: raw.A2nb.map(v => v / sharedParams.countsPerMillivolt),
    vnt: raw.A2nt.map(v => v / sharedParams.countsPerMillivolt),
    signal: raw.A2.map(v => v / sharedParams.countsPerMillivoltDiff),
  });


const calcPressure = (params: ProcessParams, signal: number[]): number[] =>
  signal.map(v => v / params.s0);

const transformer =
  (source: GraphSource, result: QueryResult): GraphSource => {
    if (!result.values || result.values.length === 0) {
      return source; // no-op
    }

    const resultCols = transpose(result.values);
    source.usedPolicy = result.policy;

    const raw: RawData = fromEntries(zip(result.columns, resultCols));

    const measured1 = processRawA1(raw);
    const measured2 = processRawA2(raw);
    const rawA1 = measured1.signal;
    const rawA2 = measured2.signal;
    const offset1 = calcOffset(params1, measured1);
    const offset2 = calcOffset(params2, measured2);
    const A1 = offset1; //  zip(rawA1, offset1).map(([v, o]) => v - o);
    const A2 = zip(rawA2, offset2).map(([v, o]) => v - o);
    const pBaro = raw.baro.map(v => v / 100);
    const temp1 = calcTemp(raw.temp1);
    const temp2 = calcTemp(raw.temp2);
    const tempBaro = raw.temp.map(v => v / 10);
    const pressure1mBar = calcPressure(params1, A1);
    const pressure2mBar = calcPressure(params2, A2);
    const pressure1mmH20 = pressure1mBar.map(v => v / sharedParams.barPerMeter);
    const pressure2mmH20 = pressure2mBar.map(v => v / sharedParams.barPerMeter);
    const pressureDiffmBar = zip(pressure1mBar, pressure2mBar).map(([v1, v2]) => v1! - v2!);
    const pressureDiffmmH20 = zip(pressure1mmH20, pressure2mmH20).map(([v1, v2]) => v1! - v2!);
    const density = pressureDiffmmH20.map(v => v / sharedParams.heightDiff);
    const mmLiquid1 = zip(pressure1mmH20, density).map(([p, d]) => p! / d!);
    const mmLiquid2 = zip(pressure2mmH20, density).map(([p, d]) => p! / d!);

    const processed: ProcessedData = {
      time: raw.time,
      A1: offset1,
      A2: offset2,
      rawA1,
      rawA2,
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
        name: colKey, //valueName(source, key),
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
