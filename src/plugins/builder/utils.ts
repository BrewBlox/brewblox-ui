import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress, ComparedBlockType } from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils/info';
import { Coordinates, CoordinatesParam } from '@/utils/coordinates';
import { createDialog, createDialogPromise } from '@/utils/dialog';
import { deepCopy } from '@/utils/objects';
import { Block } from 'brewblox-proto/ts';
import isObject from 'lodash/isObject';
import range from 'lodash/range';
import reduce from 'lodash/reduce';
import { nanoid } from 'nanoid';
import { Router } from 'vue-router';
import {
  CENTER,
  DEFAULT_LAYOUT_HEIGHT,
  DEFAULT_LAYOUT_WIDTH,
  PASSTHROUGH_KEY,
  SQUARE_SIZE,
} from './const';
import { useBuilderStore } from './store';
import {
  BuilderLayout,
  BuilderPart,
  PartFlows,
  PartTransitions,
} from './types';

export function settingsProp<T = any>(
  settings: Mapped<any>,
  key: string,
  validator?: string | ((v: any) => boolean),
): T | undefined {
  const value = settings[key];
  if (
    typeof validator === 'undefined' ||
    (typeof validator === 'string' && typeof value === validator) ||
    (typeof validator === 'function' && validator(value))
  ) {
    return value as T;
  }
  return undefined;
}

export function settingsAddress(part: BuilderPart, key: string): BlockAddress {
  const obj = settingsProp(part.settings, key, isObject) ?? {};
  return {
    // Older objects use 'blockId' as key
    id: obj.id ?? obj.blockId ?? null,
    serviceId: obj.serviceId ?? null,
    type: obj.type ?? null,
  };
}

export function settingsBlock<T extends Block>(
  part: BuilderPart,
  key: string,
  intf: ComparedBlockType,
): T | null {
  const addr = settingsAddress(part, key);
  const block = useSparkStore().blockByAddress<T>(addr);
  return block && isCompatible(block.type, intf) ? block : null;
}

export function verticalChevrons(
  centerX: number,
  centerY: number,
): { up: string; down: string; straight: string } {
  const d1 = 4;
  const d2 = 5.8;
  const d3 = 7.5;
  const downDist = 4.1; // small -> medium -> large
  const upDist = 6; // large -> medium -> small
  return {
    up: [
      `M${centerX - d1},${centerY - upDist + d1}`,
      `L${centerX},${centerY - upDist}`,
      `L${centerX + d1},${centerY - upDist + d1}`,

      `M${centerX - d2},${centerY + d2}`,
      `L${centerX},${centerY}`,
      `L${centerX + d2},${centerY + d2}`,

      `M${centerX - d3},${centerY + upDist + d3}`,
      `L${centerX},${centerY + upDist}`,
      `L${centerX + d3},${centerY + upDist + d3}`,
    ].join(' '),
    down: [
      `M${centerX - d1},${centerY - downDist}`,
      `L${centerX},${centerY - downDist + d1}`,
      `L${centerX + d1},${centerY - downDist}`,

      `M${centerX - d2},${centerY}`,
      `L${centerX},${centerY + d2}`,
      `L${centerX + d2},${centerY}`,

      `M${centerX - d3},${centerY + downDist}`,
      `L${centerX},${centerY + downDist + d3}`,
      `L${centerX + d3},${centerY + downDist}`,
    ].join(' '),
    straight: [
      `M${centerX - d1},${centerY - downDist}`,
      `L${centerX},${centerY - downDist}`,
      `L${centerX + d1},${centerY - downDist}`,

      `M${centerX - d2},${centerY}`,
      `L${centerX},${centerY}`,
      `L${centerX + d2},${centerY}`,

      `M${centerX - d3},${centerY + downDist}`,
      `L${centerX},${centerY + downDist}`,
      `L${centerX + d3},${centerY + downDist}`,
    ].join(' '),
  };
}

export function horizontalChevrons(
  centerX: number,
  centerY: number,
): { left: string; right: string; straight: string } {
  const d1 = 4;
  const d2 = 5.8;
  const d3 = 7.5;
  const ldist = 4.1; // small -> medium -> large
  const rdist = 6; // large -> medium -> small
  return {
    left: [
      `M${centerX + ldist},${centerY - d1}`,
      `L${centerX + ldist - d1},${centerY}`,
      `L${centerX + ldist},${centerY + d1}`,

      `M${centerX},${centerY - d2}`,
      `L${centerX - d2},${centerY}`,
      `L${centerX},${centerY + d2}`,

      `M${centerX - ldist},${centerY - d3}`,
      `L${centerX - ldist - d3},${centerY}`,
      `L${centerX - ldist},${centerY + d3}`,
    ].join(' '),
    right: [
      `M${centerX + rdist - d1},${centerY - d1}`,
      `L${centerX + rdist},${centerY}`,
      `L${centerX + rdist - d1},${centerY + d1}`,

      `M${centerX - d2},${centerY - d2}`,
      `L${centerX},${centerY}`,
      `L${centerX - d2},${centerY + d2}`,

      `M${centerX - rdist - d3},${centerY - d3}`,
      `L${centerX - rdist},${centerY}`,
      `L${centerX - rdist - d3},${centerY + d3}`,
    ].join(' '),
    straight: [
      `M${centerX + ldist},${centerY - d1}`,
      `L${centerX + ldist},${centerY}`,
      `L${centerX + ldist},${centerY + d1}`,

      `M${centerX},${centerY - d2}`,
      `L${centerX},${centerY}`,
      `L${centerX},${centerY + d2}`,

      `M${centerX - ldist},${centerY - d3}`,
      `L${centerX - ldist},${centerY}`,
      `L${centerX - ldist},${centerY + d3}`,
    ].join(' '),
  };
}

export function colorString(val: Maybe<string>): string {
  return val ? (val.startsWith('#') ? val : `#${val}`) : '';
}

export function containerTransitions(
  { width, height }: AreaSize,
  color?: string,
): PartTransitions {
  const coords = Array(width * height)
    .fill(0)
    .map((_, n) => {
      const outFlow = new Coordinates({
        x: (n % width) + 0.5,
        y: Math.floor(n / width) + 0.5,
        z: 0,
      });
      const inFlow = new Coordinates({
        x: (n % width) + 0.1,
        y: Math.floor(n / width) + 0.1,
        z: 0,
      });
      return { in: inFlow.toString(), out: outFlow.toString() };
    });

  const result = {};

  coords.forEach((item) => {
    result[item.out] = [
      {
        outCoords: item.in,
        friction: 0,
        sink: true,
      },
    ];
    result[item.in] = [
      {
        outCoords: item.out,
        pressure: 0,
        friction: 0,
        liquids: typeof color === 'string' ? [color] : [],
        source: true,
      },
    ];
  });

  return result;
}

export function passthroughTransitions({
  width,
  height,
  settings,
}: BuilderPart): PartTransitions {
  if (!settings[PASSTHROUGH_KEY]) {
    return {};
  }
  const coords: string[] = [
    range(width).map((x) => [`${x + 0.5},0,0`, `${x + 0.5},${height},0`]),
    range(height).map((y) => [`0,${y + 0.5},0`, `${width},${y + 0.5},0`]),
  ].flat(2);
  return coords.reduce(
    (acc, coord) => {
      acc[coord] = [{ outCoords: CENTER, internal: true, friction: 0.5 }];
      return acc;
    },
    { [CENTER]: coords.map((outCoords) => ({ outCoords, friction: 0.5 })) },
  );
}

export function coord2grid(val: number): number {
  return val * SQUARE_SIZE;
}

export function grid2coord(val: number): number {
  return Math.round(val / SQUARE_SIZE);
}

export function coord2translate(x: number, y: number): string {
  return `translate(${coord2grid(x)}, ${coord2grid(y)})`;
}

export function textTransformation(
  part: BuilderPart,
  { width, height }: AreaSize, // text dimensions
  counterRotate = true,
): string {
  const transforms: string[] = [];
  if (part.flipped) {
    transforms.push(`translate(${coord2grid(width)}, 0) scale(-1,1)`);
  }
  if (part.rotate && counterRotate) {
    const originX = coord2grid(0.5 * width);
    const originY = coord2grid(0.5 * height);
    transforms.push(`rotate(${-part.rotate},${originX},${originY})`);
  }
  return transforms.join(' ');
}

export function elbow(dX: number, dY: number, fromHorizontal: boolean): string {
  const dx1 = fromHorizontal ? 0.5 * dX : 0;
  const dy1 = fromHorizontal ? 0 : 0.5 * dY;
  const dx2 = fromHorizontal ? dX : 0.5 * dX;
  const dy2 = fromHorizontal ? 0.5 * dY : dY;
  return `c${dx1},${dy1} ${dx2},${dy2} ${dX},${dY}`;
}

export function showAbsentBlock(part: BuilderPart, key: string): void {
  const addr = settingsAddress(part, key);
  if (!!addr.serviceId && !!addr.id) {
    createDialog({
      component: 'ConfirmDialog',
      componentProps: {
        title: 'Broken Link',
        message: `Block '${addr.id}' was not found. Please assign a new block.`,
        cancel: false,
      },
    });
  }
}

export function rotatedCoord(
  part: BuilderPart,
  coord: CoordinatesParam,
): string {
  return new Coordinates(coord)
    .flipShapeEdge(Boolean(part.flipped), 0, part)
    .rotateShapeEdge(part.rotate, 0, part)
    .toString();
}

export function liquidOnCoord(
  part: BuilderPart,
  flows: PartFlows,
  baseInCoords: string,
): string[] {
  const flow = flows[rotatedCoord(part, baseInCoords)];
  return flow ? Object.keys(flow) : [];
}

export function liquidBorderColor(flows: PartFlows): string {
  for (const coord in flows) {
    const flow = flows[coord];
    for (const color in flow) {
      if (flow[color] != 0) {
        return color;
      }
    }
  }
  return '';
}

export function flowOnCoord(
  part: BuilderPart,
  flows: PartFlows,
  baseInCoords: string,
): number {
  const flow = flows[rotatedCoord(part, baseInCoords)];
  return flow ? reduce(flow, (sum, v) => sum + v, 0) : 0;
}

export async function startAddLayout(
  source?: Maybe<BuilderLayout>,
): Promise<string | null> {
  const title = await createDialogPromise({
    component: 'InputDialog',
    componentProps: {
      modelValue: 'Brewery Layout',
      title: 'New Layout',
      message: 'Create a new Brewery Builder layout',
    },
  });
  if (!title) {
    return null;
  }
  const id = nanoid();
  const builderStore = useBuilderStore();
  await builderStore.createLayout({
    id,
    title,
    width: source?.width ?? DEFAULT_LAYOUT_WIDTH,
    height: source?.height ?? DEFAULT_LAYOUT_HEIGHT,
    parts: deepCopy(source?.parts) ?? [],
  });
  return id;
}

export function startChangeLayoutTitle(layout: Maybe<BuilderLayout>): void {
  if (!layout) {
    return;
  }
  const builderStore = useBuilderStore();
  createDialog({
    component: 'InputDialog',
    componentProps: {
      title: 'Change Layout title',
      message: `Choose a new name for ${layout.title}`,
      modelValue: layout.title,
    },
  }).onOk((title: string) => {
    if (layout) {
      builderStore.saveLayout({ ...layout, title });
    }
  });
}

export function startRemoveLayout(
  layout: Maybe<BuilderLayout>,
  router: Router,
): void {
  if (!layout) {
    return;
  }
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Remove layout',
      message: `Are you sure you wish to remove ${layout.title}?`,
      noBackdropDismiss: true,
    },
  }).onOk(async () => {
    if (layout) {
      const builderStore = useBuilderStore();
      await builderStore.removeLayout(layout).catch(() => {});
    }
    const path = router.currentRoute.value.path;
    if (path === `/brewery/${layout.id}`) {
      router.replace('/brewery');
    } else if (path === `/builder/${layout.id}`) {
      router.replace('/builder');
    }
  });
}
