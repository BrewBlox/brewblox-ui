export const widgetSize = {
  cols: 4,
  rows: 2,
};

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
