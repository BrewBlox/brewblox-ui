import { afterEach, describe, expect, it, vi } from 'vitest';

async function traceTypeWith(context: unknown): Promise<string> {
  vi.resetModules();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as RenderingContext,
  );
  const { lineTraceType } = await import('@/utils/graph');
  return lineTraceType();
}

describe('lineTraceType', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('draws lines with WebGL where it is available', async () => {
    const loseContext = vi.fn();
    const gl = { getExtension: () => ({ loseContext }) };
    expect(await traceTypeWith(gl)).toBe('scattergl');
    expect(loseContext).toHaveBeenCalled();
  });

  it('draws lines as SVG where WebGL lacks what plotly needs', async () => {
    const gl = {
      getExtension: (name: string) =>
        name === 'OES_element_index_uint' ? null : { loseContext: () => {} },
    };
    expect(await traceTypeWith(gl)).toBe('scatter');
  });

  it('draws lines as SVG without WebGL', async () => {
    expect(await traceTypeWith(null)).toBe('scatter');
  });

  it('checks once', async () => {
    const { lineTraceType } = await import('@/utils/graph');
    lineTraceType();
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    lineTraceType();
    expect(spy).not.toHaveBeenCalled();
  });
});
