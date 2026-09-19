import mapKeys from 'lodash/mapKeys';
import { Coordinates } from '@/utils/coordinates';
import { solveNetworkFlows } from './flowNetwork';
import {
  BuilderPart,
  FlowPart,
  FlowRoute,
  PartFlows,
  PartTransitions,
} from './types';

const normalizeFlows = (
  acc: Mapped<PartFlows>,
  part: FlowPart,
): Mapped<PartFlows> => {
  if (part.flows) {
    acc[part.id] = mapKeys(part.flows, (flow, inCoord) =>
      new Coordinates(inCoord).translate([-part.x, -part.y, 0]).toString(),
    );
  }
  return acc;
};

/**
 * Translates blueprint transitions to absolute coordinates.
 * Blueprints return coordinates relative to the part anchor,
 * and are not aware of the part position, rotation, or flip.
 */
export const translatedTransitions = (
  part: BuilderPart,
  transitions: Maybe<PartTransitions>,
): PartTransitions => {
  if (!transitions) {
    return {};
  }

  const result: PartTransitions = {};
  for (const inCoordStr in transitions) {
    const routes = transitions[inCoordStr];
    // inCoords are relative from part anchor === [0, 0, 0]

    const updatedInCoordStr = new Coordinates(inCoordStr)
      .flipShapeEdge(!!part.flipped, 0, part)
      .translate([part.x, part.y, 0])
      .rotateShapeEdge(part.rotate, 0, part, [part.x, part.y, 0])
      .toString();

    const updatedRoutes = routes.map((route: FlowRoute) => ({
      ...route,
      outCoords: new Coordinates(route.outCoords)
        .flipShapeEdge(!!part.flipped, 0, part)
        .translate([part.x, part.y, 0])
        .rotateShapeEdge(part.rotate, 0, part, [part.x, part.y, 0])
        .toString(),
    }));

    result[updatedInCoordStr] = updatedRoutes;
  }
  return result;
};

/**
 * Translates blueprint transitions for all parts to absolute coordinates.
 */
export const absoluteTransitions = (
  parts: BuilderPart[],
  allTransitions: Mapped<PartTransitions>,
): Mapped<PartTransitions> =>
  parts.reduce((acc, part) => {
    acc[part.id] = translatedTransitions(part, allTransitions[part.id]);
    return acc;
  }, {});

export const asFlowParts = (
  parts: BuilderPart[],
  allTransitions: Mapped<PartTransitions>,
): FlowPart[] =>
  parts.map((part) => ({
    ...part,
    transitions: translatedTransitions(part, allTransitions[part.id]),
    flows: {},
  }));

/**
 * Calculates flows for all parts.
 * Flow coordinates are absolute, as used in part transitions.
 */
export const calculateFlows = (
  parts: FlowPart[],
  warnings: Set<string> = new Set(),
): FlowPart[] => solveNetworkFlows(parts, warnings);

export interface FlowCalculation {
  flows: Mapped<PartFlows>;
  /**
   * Distinct warnings raised while calculating.
   * The calculation is best effort: flows are still returned,
   * but may be incorrect where a warning applies.
   */
  warnings: string[];
}

/**
 * Calculates flows for all parts.
 * `transitions` must have absolute coordinates: see `absoluteTransitions()`.
 * Flow coordinates in the result are relative to the part.
 */
export const calculateNormalizedFlows = (
  parts: BuilderPart[],
  transitions: Mapped<PartTransitions>,
): FlowCalculation => {
  const warnings = new Set<string>();
  const flowParts: FlowPart[] = parts.map((part) => ({
    ...part,
    transitions: transitions[part.id] ?? {},
    flows: {},
  }));
  const flows = calculateFlows(flowParts, warnings).reduce(normalizeFlows, {});
  return { flows, warnings: [...warnings] };
};
