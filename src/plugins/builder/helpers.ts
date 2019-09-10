import get from 'lodash/get';

import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { builderStore } from './store';
import { FlowPart, LinkedBlock, PersistentPart, StatePart } from './types';

export function settingsBlock<T extends Block>(part: PersistentPart, key: string): T | null {
  const serviceId = get(part.settings, [key, 'serviceId'], null);
  const blockId = get(part.settings, [key, 'blockId'], null);
  return serviceId && blockId
    ? sparkStore.tryBlockById(serviceId, blockId) as T | null
    : null;
}

export function settingsLink(part: PersistentPart, key: string): LinkedBlock {
  const serviceId = get(part.settings, [key, 'serviceId'], null);
  const blockId = get(part.settings, [key, 'blockId'], null);
  return { serviceId, blockId };
};

export function asPersistentPart(part: PersistentPart | FlowPart): PersistentPart {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { transitions, size, flows, ...persistent } = part as FlowPart;
  return persistent;
}

export function asStatePart(part: PersistentPart): StatePart {
  const spec = builderStore.specById(part.type);
  return {
    ...part,
    transitions: spec.transitions(part),
    size: spec.size(part),
  };
}

export function verticalChevrons(cX: number, cY: number): { up: string[]; down: string[]; straight: string[] } {
  const d1 = 4;
  const d2 = 5.8;
  const d3 = 7.5;
  const downDist = 4.1; // small -> medium -> large
  const upDist = 6; // large -> medium -> small
  return {
    up: [
      `${cX - d1},${cY - upDist + d1}  ${cX},${cY - upDist}  ${cX + d1},${cY - upDist + d1}`,
      `${cX - d2},${cY + d2}           ${cX},${cY}           ${cX + d2},${cY + d2}`,
      `${cX - d3},${cY + upDist + d3}  ${cX},${cY + upDist}  ${cX + d3},${cY + upDist + d3}`,
    ],
    down: [
      `${cX - d1},${cY - downDist}  ${cX},${cY - downDist + d1}  ${cX + d1},${cY - downDist}`,
      `${cX - d2},${cY}             ${cX},${cY + d2}             ${cX + d2},${cY}`,
      `${cX - d3},${cY + downDist}  ${cX},${cY + downDist + d3}  ${cX + d3},${cY + downDist}`,
    ],
    straight: [
      `${cX - d1},${cY - downDist}  ${cX},${cY - downDist}  ${cX + d1},${cY - downDist}`,
      `${cX - d2},${cY}             ${cX},${cY}             ${cX + d2},${cY}`,
      `${cX - d3},${cY + downDist}  ${cX},${cY + downDist}  ${cX + d3},${cY + downDist}`,
    ],
  };
}

export function horizontalChevrons(cX: number, cY: number): { left: string[]; right: string[]; straight: string[] } {
  const d1 = 4;
  const d2 = 5.8;
  const d3 = 7.5;
  const ldist = 4.1; // small -> medium -> large
  const rdist = 6; // large -> medium -> small
  return {
    left: [
      `${cX + ldist},${cY - d1}  ${cX + ldist - d1},${cY}  ${cX + ldist},${cY + d1}`,
      `${cX}        ,${cY - d2}  ${cX - d2}        ,${cY}  ${cX}        ,${cY + d2}`,
      `${cX - ldist},${cY - d3}  ${cX - ldist - d3},${cY}  ${cX - ldist},${cY + d3}`,
    ],
    right: [
      `${cX + rdist - d1},${cY - d1}  ${cX + rdist},${cY}  ${cX + rdist - d1},${cY + d1}`,
      `${cX - d2}        ,${cY - d2}  ${cX}        ,${cY}  ${cX - d2}        ,${cY + d2}`,
      `${cX - rdist - d3},${cY - d3}  ${cX - rdist},${cY}  ${cX - rdist - d3},${cY + d3}`,
    ],
    straight: [
      `${cX + ldist},${cY - d1}  ${cX + ldist},${cY}  ${cX + ldist},${cY + d1}`,
      `${cX}        ,${cY - d2}  ${cX}        ,${cY}  ${cX}        ,${cY + d2}`,
      `${cX - ldist},${cY - d3}  ${cX - ldist},${cY}  ${cX - ldist},${cY + d3}`,
    ],
  };
}

export function colorString(val: string | null): string {
  return val
    ? (val.startsWith('#') ? val : `#${val}`)
    : '';
}
