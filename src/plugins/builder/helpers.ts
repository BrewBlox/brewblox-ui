import { Coordinates, rotatedSize } from '@/helpers/coordinates';
import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockAddress } from '@/plugins/spark/types';
import { dashboardStore } from '@/store/dashboards';

import { SQUARE_SIZE } from './getters';
import { builderStore } from './store';
import { FlowPart, PersistentPart, Rect, StatePart, Transitions } from './types';

export function settingsAddress(part: PersistentPart, key: string): BlockAddress {
  const obj: any = part.settings[key] ?? {};
  return {
    // Older objects use 'blockId' as key
    id: obj.id ?? obj.blockId ?? null,
    serviceId: obj.serviceId ?? null,
    type: obj.type ?? null,
  };
}

export function settingsBlock<T extends Block>(part: PersistentPart, key: string): T | null {
  const addr = settingsAddress(part, key);
  return sparkStore.blockById(addr.serviceId, addr.id);
}

export function asPersistentPart(part: PersistentPart | FlowPart): PersistentPart {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { transitions, size, flows, ...persistent } = part as FlowPart;
  return persistent;
}

export function asStatePart(part: PersistentPart): StatePart {
  const spec = builderStore.spec(part);
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

export function containerTransitions([sizeX, sizeY]: [number, number], color?: string): Transitions {
  const coords = Array(sizeX * sizeY)
    .fill(0)
    .map((_, n) => {
      const outFlow = new Coordinates({ x: (n % sizeX) + 0.5, y: Math.floor(n / sizeX) + 0.5, z: 0 });
      const inFlow = new Coordinates({ x: (n % sizeX) + 0.1, y: Math.floor(n / sizeX) + 0.1, z: 0 });
      return { in: inFlow.toString(), out: outFlow.toString() };
    });

  const result = {};

  coords.forEach(item => {
    result[item.out] = [{
      outCoords: item.in,
      friction: 0,
      sink: true,
    }];
    result[item.in] = [{
      outCoords: item.out,
      pressure: 0,
      friction: 0,
      liquids: color ? [color] : [],
      source: true,
    }];
  });

  return result;
}

export function squares(val: number): number {
  return SQUARE_SIZE * val;
}

export function textTransformation(part: PersistentPart, textSize: [number, number], counterRotate = true): string {
  const [sizeX] = rotatedSize(part.rotate, textSize);
  const transforms: string[] = [];
  if (part.flipped) {
    transforms.push(`translate(${squares(sizeX)}, 0) scale(-1,1)`);
  }
  if (part.rotate && counterRotate) {
    transforms.push(`rotate(${-part.rotate},${squares(0.5 * textSize[0])},${squares(0.5 * textSize[1])})`);
  }
  return transforms.join(' ');
}

export function elbow(dX: number, dY: number, horizontal: boolean): string {
  const dx1 = horizontal ? 0.5 * dX : 0;
  const dy1 = horizontal ? 0 : 0.5 * dY;
  const dx2 = horizontal ? dX : 0.5 * dX;
  const dy2 = horizontal ? 0.5 * dY : dY;
  return `c${dx1},${dy1} ${dx2},${dy2} ${dX},${dY}`;
}

export function showAbsentBlock(part: PersistentPart, key: string): void {
  const addr = settingsAddress(part, key);
  if (!!addr.serviceId && !!addr.id) {
    createDialog({
      title: 'Broken Link',
      message: `Block '${addr.id}' was not found. Use the editor to change the link.`,
    });
  }
}

export function showSettingsBlock(part: PersistentPart, key: string): void {
  const block = settingsBlock(part, key);
  block !== null
    ? createBlockDialog(block, { mode: 'Basic' })
    : showAbsentBlock(part, key);
}

export function showDrivingBlockDialog(part: PersistentPart, key: string): void {
  const block = settingsBlock(part, key);

  if (!block) {
    return showAbsentBlock(part, key);
  }

  const driveChain = sparkStore
    .serviceById(block.serviceId)
    ?.drivenChains
    .find(chain => chain[0] === block.id);

  const actual = driveChain !== undefined
    ? sparkStore.blockById(block.serviceId, driveChain[driveChain.length - 1])
    : block;

  if (actual) {
    createBlockDialog(actual, { mode: 'Basic' });
  }
}

export function showLinkedWidgetDialog(part: PersistentPart, key: string): void {
  const widgetId = part.settings[key];
  if (!widgetId) {
    return;
  }
  else if (dashboardStore.widgetIds.includes(widgetId)) {
    createDialog({
      component: 'StoreWidgetDialog',
      mode: 'Basic',
      widgetId,
    });
  }
  else {
    createDialog({
      title: 'Broken Link',
      message: 'Widget was not found. Use the editor to change the link.',
    });
  }
}

export function rectContains(rect: Rect, x: number, y: number): boolean {
  return x >= rect.left
    && x <= rect.right
    && y >= rect.top
    && y <= rect.bottom;
}
