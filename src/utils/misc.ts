import { colors } from 'quasar';

export function contrastColor(background: string): string {
  // Algorithm copied from StackOverflow at 2019/06/27
  // https://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
  const rgb = colors.hexToRgb(background);
  const luma = ((0.299 * rgb.r) + (0.587 * rgb.g) + (0.114 * rgb.b)) / 255;
  return luma > 0.8 ? 'black' : 'white';
}
