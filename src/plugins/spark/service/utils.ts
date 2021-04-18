import { WidgetRole } from '@/store/features';
import { objectStringSorter } from '@/utils/functional';

import { SparkSessionConfig } from '../types';
import { ValidatedWidget } from './types';


const roleOrder: Record<WidgetRole, number> = {
  Display: 0,
  Process: 1,
  Control: 2,
  Output: 3,
  Constraint: 4,
  Other: 5,
};

export const blockSorters = (): { [id: string]: (a: ValidatedWidget, b: ValidatedWidget) => number } => ({
  unsorted: () => 0,
  name: (a, b) => objectStringSorter('id')(a, b),
  type: (a, b): number => {
    const left = a.title.toLowerCase();
    const right = b.title.toLowerCase();
    return left.localeCompare(right);
  },
  role: (a, b): number =>
    roleOrder[a.role] - roleOrder[b.role],
});

export const defaultSessionConfig = (): SparkSessionConfig => ({
  expandedBlocks: {},
  sorting: 'name',
  pageMode: 'Relations',
});

export const storageKey = (serviceId: string): string =>
  `storage__Spark__${serviceId}`;


// source: https://www.adriangranados.com/blog/dbm-to-percent-conversion
export const calcWiFiPct =
  (dbm: number): number => {
    if (dbm < -92) {
      return 1;
    }
    if (dbm > -21) {
      return 100;
    }
    return Math.round(((-0.0154 * dbm * dbm) - (0.3794 * dbm)) + 98.182);
  };
