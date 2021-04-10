import { TempUnit } from '@/shared-types';
import { systemStore } from '@/store/system';

import { bloxQty, JSQuantity } from './Quantity';

type TempFunc = (valueDegC: number | null) => JSQuantity;

const converted = (valueDegC: number | null, fmt: (unit: TempUnit) => string): JSQuantity =>
  bloxQty(valueDegC, fmt('degC')).to(fmt(systemStore.units.temperature));

export const tempQty: TempFunc = v => converted(v, u => u);
export const inverseTempQty: TempFunc = v => converted(v, u => `1 / ${u}`);
export const deltaTempQty: TempFunc = v => converted(v, u => `delta_${u}`);
export const deltaTempPerSecondQty: TempFunc = v => converted(v, u => `delta_${u} / second`);
export const deltaTempPerMinuteQty: TempFunc = v => converted(v, u => `delta_${u} / minute`);
export const deltaTempPerHourQty: TempFunc = v => converted(v, u => `delta_${u} / hour`);
export const deltaTempMultSecondQty: TempFunc = v => converted(v, u => `delta_${u} * second`);
export const deltaTempMultMinuteQty: TempFunc = v => converted(v, u => `delta_${u} * minute`);
export const deltaTempMultHourQty: TempFunc = v => converted(v, u => `delta_${u} * hour`);
