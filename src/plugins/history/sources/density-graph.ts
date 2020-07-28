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
  ds2: number;
}

interface SharedParams {
  heightLowest: number;
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

interface Correction {
  offset: number[];
  gain: number[];
}

interface ProcessedData {
  time: number[];
  'Barometric pressure [mbar]': number[];
  'Pressure 1 [mmH20]': number[];
  'Pressure 2 [mmH20]': number[];
  'Density [kg/L]': (number | null)[];
  'Volume [L]': number[];
  'Weight [kg]': number[];
}

const transpose = (matrix: any[][]): any[][] => matrix[0].map((_, idx) => matrix.map(row => row[idx]));

const boundedConcat =
  (left: (number | null)[] = [], right: (number | null)[] = [], maxLength: number = MAX_POINTS): (number | null)[] => {
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
  s0: 0.043024377643356655,
  ds: 2.075390139308336e-05,
  rpt: 1.0013830507520656,
  rnt: 1.0010236648263195,
  rpb: 0.9986169492479344,
  rnb: 0.9989763351736805,
  ds2: -9.553453229527372e-07,
};

const params2: ProcessParams = {
  s0: 0.04301445082035823,
  ds: 0.00045906562172523204,
  rpt: 1.0012285643740704,
  rnb: 0.9990673548797273,
  rnt: 1.0009326451202727,
  rpb: 0.9987714356259296,
  ds2: -2.8441926138146005e-06,
};

const sharedParams: SharedParams = {
  heightLowest: 100.0,
  heightDiff: 287.0,
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

const calcCorrections = (params: ProcessParams, measured: SensorMeasurement): Correction => {
  const v = zip(measured.vpb, measured.vpt, measured.vnb, measured.vnt).map(([a, b, c, d]) => (a! + b! + c! + d!) / 2);

  const v0 = 2000;
  const sensitivity = v.map(v => params.s0 * (1 + params.ds * (v - v0) + + params.ds2 * (v - v0) ** 2));
  const offset = v.map(v => v * (params.rpb / (params.rpb + params.rpt) - params.rnb / (params.rnb + params.rnt)));
  const gain = zip(sensitivity, v).map(([s, v]) => (s!));

  return { offset, gain };
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
    const corr1 = calcCorrections(params1, measured1);
    const corr2 = calcCorrections(params2, measured2);
    const pressure1mBar = zip(measured1.signal, corr1.offset, corr1.gain).map(([v, o, g]) => ((v! - o!) / g!));
    const pressure2mBar = zip(measured2.signal, corr2.offset, corr2.gain).map(([v, o, g]) => ((v! - o!) / g!));
    const pBaro = raw.baro.map(v => v / 100);
    // const tempBaro = raw.temp.map(v => v / 10);
    const pressure1mmH20 = pressure1mBar.map(v => v! / sharedParams.barPerMeter);
    const pressure2mmH20 = pressure2mBar.map(v => v! / sharedParams.barPerMeter);
    // const pressureDiffmBar = zip(pressure1mBar, pressure2mBar).map(([v1, v2]) => v1! - v2!);
    const pressureDiffmmH20 = zip(pressure1mmH20, pressure2mmH20).map(([v1, v2]) => v1! - v2!);
    const density = pressureDiffmmH20.map((v) => {
      const d = v / sharedParams.heightDiff;
      return (d > 0.5 && d < 1.5) ? d : null;
    }); // assume 20C
    const mmLiquid1 = zip(pressure1mmH20, density).map(([p, d]) => d ? p! / d : p);
    // const mmLiquid2 = zip(pressure2mmH20, density).map(([p, d]) => d ? p! / d : p);
    const volume = mmLiquid1.map((v => (sharedParams.heightLowest + v!) / 100 * 3.15 ** 2 * Math.PI));
    const weight = zip(volume, density).map(([v, d]) => v! * d!);

    const processed: ProcessedData = {
      time: raw.time,
      'Density [kg/L]': density,
      'Volume [L]': volume,
      'Weight [kg]': weight,
      'Pressure 1 [mmH20]': pressure1mmH20,
      'Pressure 2 [mmH20]': pressure2mmH20,
      'Barometric pressure [mbar]': pBaro,
    };

    forEach(processed, (newValues: (number | null)[], colKey: string) => {
      if (colKey === 'time') {
        return;
      }
      const key = `${result.name}/${colKey}`;
      const existing = source.values[key] ?? {};
      source.values[key] = {
        type: 'scatter',
        ...existing,
        yaxis: colKey.startsWith('Density') ? 'y2' : 'y',
        name: colKey.startsWith('Density')
          ? `<span style="color: #aef">${colKey}<br>${newValues[newValues.length - 1]!.toFixed(4)}</span>`
          : `<span>${colKey}<br>${newValues[newValues.length - 1]!.toFixed(2)}</span>`,

        visible: colKey.startsWith('Density') ? true : 'legendonly',
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
