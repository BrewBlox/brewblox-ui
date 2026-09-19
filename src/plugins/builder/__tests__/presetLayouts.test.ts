import { describe, expect, it } from 'vitest';
import blueprints from '@/plugins/builder/blueprints';
import {
  absoluteTransitions,
  calculateNormalizedFlows,
} from '@/plugins/builder/calculateFlows';
import { VALVE_CLOSED_KEY } from '@/plugins/builder/const';
import {
  BuilderLayout,
  BuilderPart,
  PartTransitions,
} from '@/plugins/builder/types';
import presets from '../../../../dev/presets/brewblox-ui-store.redis.json';

/**
 * The layouts in the dev presets are realistic brewery layouts.
 * Linked blocks are not available here:
 * linked valves are closed, and linked pumps are off.
 */

const layouts: BuilderLayout[] = (presets as any[]).filter(
  (v) => v.namespace === 'brewblox-ui-store:layouts',
);

const makeAllTransitions = (parts: BuilderPart[]): Mapped<PartTransitions> =>
  parts.reduce((acc, part) => {
    const transitions = blueprints[part.type]?.transitions(part);
    if (transitions) {
      acc[part.id] = transitions;
    }
    return acc;
  }, {});

const allValues = (flows: Mapped<Mapped<Mapped<number>>>): number[] =>
  Object.values(flows).flatMap((part) =>
    Object.values(part).flatMap((coord) => Object.values(coord)),
  );

describe('Preset layouts', () => {
  it('are available', () => {
    expect(layouts.length).toBeGreaterThan(0);
  });

  for (const layout of layouts) {
    describe(layout.title, () => {
      it('is calculated without errors', () => {
        const start = performance.now();
        const { flows, warnings } = calculateNormalizedFlows(
          layout.parts,
          absoluteTransitions(layout.parts, makeAllTransitions(layout.parts)),
        );
        expect(performance.now() - start).toBeLessThan(200);
        expect(warnings).toEqual([]);
        allValues(flows).forEach((v) => expect(Number.isFinite(v)).toBe(true));
      });

      it('is calculated without errors with all valves open', () => {
        const parts = layout.parts.map((part) =>
          part.type === 'Valve'
            ? { ...part, settings: { [VALVE_CLOSED_KEY]: false } }
            : part,
        );
        const start = performance.now();
        const { flows, warnings } = calculateNormalizedFlows(
          parts,
          absoluteTransitions(parts, makeAllTransitions(parts)),
        );
        expect(performance.now() - start).toBeLessThan(200);
        expect(warnings).toEqual([]);
        allValues(flows).forEach((v) => expect(Number.isFinite(v)).toBe(true));
      });
    });
  }
});
