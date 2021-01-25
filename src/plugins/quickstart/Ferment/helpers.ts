import { bloxQty } from '@/helpers/bloxfield';

import { PidConfig } from '../types';

export const makeBeerCoolConfig = (): PidConfig => ({
  kp: bloxQty(-50, '1/degC'),
  ti: bloxQty('6h'),
  td: bloxQty('30m'),
});

export const makeBeerHeatConfig = (): PidConfig => ({
  kp: bloxQty(100, '1/degC'),
  ti: bloxQty('6h'),
  td: bloxQty('30m'),
});

export const makeFridgeCoolConfig = (): PidConfig => ({
  kp: bloxQty(-20, '1/degC'),
  ti: bloxQty('2h'),
  td: bloxQty('10m'),
});

export const makeFridgeHeatConfig = (): PidConfig => ({
  kp: bloxQty(20, '1/degC'),
  ti: bloxQty('2h'),
  td: bloxQty('10m'),
});
