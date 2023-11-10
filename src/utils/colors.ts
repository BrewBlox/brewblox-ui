import { colors } from 'quasar';

const cache: { [k: string]: string | null } = {};
let context: CanvasRenderingContext2D | null = null;

function getContext(): CanvasRenderingContext2D | null {
  if (context) {
    return context;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  context = canvas.getContext('2d', { willReadFrequently: true });
  return context;
}

function parse(ctx: CanvasRenderingContext2D, color: string): string | null {
  ctx.clearRect(0, 0, 1, 1);
  // In order to detect invalid values,
  // we can't rely on color being in the same format as what fillStyle is computed as,
  // but we can ask it to implicitly compute a normalized value twice and compare.
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  const computed = ctx.fillStyle;
  ctx.fillStyle = '#fff';
  ctx.fillStyle = color;
  if (computed !== ctx.fillStyle) {
    return null; // invalid color
  }
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return colors.rgbToHex({ r, g, b });
}

export function parseColor(color: Maybe<string>): string | null {
  if (color == null) {
    return null;
  }

  if (color in cache) {
    return cache[color];
  }

  const ctx = getContext();
  if (ctx == null) {
    return null;
  }

  const result = parse(ctx, color);
  cache[color] = result;
  return result;
}
