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
  dss: number;
  v0: number;
}

interface SharedParams {
  heightLowest: number;
  heightDiff: number; // mm between sensors
  countsPerMillivolt: number;
  countsPerMillivoltDiff: number;
  diameter: number;
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
  'Barometric pressure [mbar]': (number | null)[];
  'Pressure 1 [mmH20]': (number | null)[];
  'Pressure 2 [mmH20]': (number | null)[];
  'Density [kg/L]': (number | null)[];
  'Volume [L]': (number | null)[];
  'Weight [kg]': (number | null)[];
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


const tempTarget: QueryTarget = {
  measurement: 'spark-one',
  fields: [
    'Wijnvat 1 sensor [degC]',
  ],
};


const params1: ProcessParams = {
  s0: 0.04201837939975203,
  rpb: 0.9986215386469219,
  rpt: 1.001378461353078,
  rnb: 0.9989809293970966,
  rnt: 1.0010190706029034,
  ds: -2.750817701142761e-05,
  dss: -1.2307603088647225e-06,
  v0: 2053.22317480223,
};

const params2: ProcessParams = {
  s0: 0.042223883296850485,
  rpb: 0.9987760602195516,
  rpt: 1.0012239397804485,
  rnb: 0.9990719802240943,
  rnt: 1.0009280197759058,
  ds: -0.0003220693446672942,
  dss: -3.101764618106398e-06,
  v0: 2141.1235810954818,
};

const sharedParams: SharedParams = {
  heightLowest: 99.0,
  heightDiff: 290.0,
  countsPerMillivolt: 2 ** 23 / 1350,
  countsPerMillivoltDiff: 32 * 2 ** 23 / 1350,
  diameter: 630,
  barPerMeter: 0.0980665,
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
  const gain = v.map(v => params.s0 * (1 + params.ds * (v - params.v0) + + params.dss * (v - params.v0) ** 2));
  const offset = v.map(v => v * (params.rnt / (params.rnb + params.rnt) - params.rpt / (params.rpb + params.rpt)));

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
    const pressure1mBar = zip(measured1.signal, corr1.offset, corr1.gain).map(([v, o, g]) => v && o && g ? ((v - o) / g) : null);
    const pressure2mBar = zip(measured2.signal, corr2.offset, corr2.gain).map(([v, o, g]) => v && o && g ? ((v - o) / g) : null);
    const pBaro = raw.baro.map(v => v / 100);
    // const tempBaro = raw.temp.map(v => v / 10);
    const pressure1mmH20 = pressure1mBar.map(v => v! / sharedParams.barPerMeter);
    const pressure2mmH20 = pressure2mBar.map(v => v! / sharedParams.barPerMeter);
    // const pressureDiffmBar = zip(pressure1mBar, pressure2mBar).map(([v1, v2]) => v1! - v2!);
    const pressureDiffmmH20 = zip(pressure1mmH20, pressure2mmH20).map(([v1, v2]) => v1 && v2 ? v1 - v2 : null);
    const density = pressureDiffmmH20.map((v) => {
      const d = v ? v / sharedParams.heightDiff : null;
      return d && (d > 0.5 && d < 1.5) ? d : null;
    }); // assume 20C
    const mmLiquid1 = zip(pressure1mmH20, density).map(([p, d]) => d && p ? p / d : p);
    // const mmLiquid2 = zip(pressure2mmH20, density).map(([p, d]) => d ? p! / d : p);
    const volume = mmLiquid1.map((v => v ? (sharedParams.heightLowest + v) / 100 * (sharedParams.diameter / 200) ** 2 * Math.PI : null));
    const weight = zip(volume, density).map(([v, d]) => v && d ? v * d : null);

    const processed: ProcessedData = {
      time: raw.time,
      'Density [kg/L]': density,
      'Volume [L]': volume,
      'Weight [kg]': weight,
      'Pressure 1 [mmH20]': pressure1mmH20,
      'Pressure 2 [mmH20]': pressure2mmH20,
      'Barometric pressure [mbar]': pBaro,
    };

    const tempCorrect = (sg: number, t: number): number =>
      (999.83952 + 16.945176 * t - 7.9870401e-3 * t ** 2
        - 46.170461e-6 * t ** 3 + 105.56302e-9 * t ** 4 - 280.54253e-12 * t ** 5) /
      (1 + 16.897850e-3 * t);


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
          ? `<span style="color: #aef">${colKey}<br>${(newValues ? newValues[newValues.length - 1] || 0.0 : 0.0).toFixed(4)}</span>`
          : `<span>${colKey}<br>${(newValues ? newValues[newValues.length - 1] || 0.0 : 0.0).toFixed(2)}</span>`,

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
