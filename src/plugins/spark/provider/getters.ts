import { systemBlockTypes } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';

export const widgetSize = {
  cols: 4,
  rows: 2,
};

const requiredSystemBlocks = [
  systemBlockTypes.SysInfo,
  systemBlockTypes.Groups,
  systemBlockTypes.OneWireBus,
  systemBlockTypes.Ticks,
];

export const isReady =
  (serviceId: string): boolean =>
    sparkStore.blockValues(serviceId)
      .filter(block => requiredSystemBlocks.includes(block.type))
      .length === requiredSystemBlocks.length;

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
