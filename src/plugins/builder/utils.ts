import defaults from 'lodash/defaults';
import range from 'lodash/range';
import reduce from 'lodash/reduce';
import { nanoid } from 'nanoid';

import { useSparkStore } from '@/plugins/spark/store';
import { Block, ComparedBlockType } from '@/plugins/spark/types';
import { BlockAddress } from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';
import { useWidgetStore } from '@/store/widgets';
import {
  Coordinates,
  CoordinatesParam,
  rotatedSize,
} from '@/utils/coordinates';
import {
  createBlockDialog,
  createDialog,
  createDialogPromise,
} from '@/utils/dialog';
import { deepCopy } from '@/utils/objects';

import {
  CENTER,
  DEFAULT_LAYOUT_HEIGHT,
  DEFAULT_LAYOUT_WIDTH,
  deprecatedTypes,
  SQUARE_SIZE,
} from './const';
import { useBuilderStore } from './store';
import {
  BuilderLayout,
  FlowPart,
  PersistentPart,
  StatePart,
  Transitions,
} from './types';

export function settingsAddress(
  part: PersistentPart,
  key: string,
): BlockAddress {
  const obj: any = part.settings[key] ?? {};
  return {
    // Older objects use 'blockId' as key
    id: obj.id ?? obj.blockId ?? null,
    serviceId: obj.serviceId ?? null,
    type: obj.type ?? null,
  };
}

export function settingsBlock<T extends Block>(
  part: PersistentPart,
  key: string,
  intf: ComparedBlockType,
): T | null {
  const addr = settingsAddress(part, key);
  const block = useSparkStore().blockByAddress<T>(addr);
  return block && isCompatible(block.type, intf) ? block : null;
}

export function asPersistentPart(
  part: PersistentPart | FlowPart,
): PersistentPart {
  const { transitions, size, flows, canInteract, ...persistent } =
    part as FlowPart;
  void { transitions, size, flows, canInteract };
  return persistent;
}

export function asStatePart(part: PersistentPart): StatePart {
  const spec = useBuilderStore().spec(part);
  return {
    ...part,
    transitions: spec.transitions(part),
    size: spec.size(part),
    canInteract: spec.interactHandler !== undefined,
  };
}

export function verticalChevrons(
  cX: number,
  cY: number,
): { up: string[]; down: string[]; straight: string[] } {
  const d1 = 4;
  const d2 = 5.8;
  const d3 = 7.5;
  const downDist = 4.1; // small -> medium -> large
  const upDist = 6; // large -> medium -> small
  return {
    up: [
      `${cX - d1},${cY - upDist + d1}  ${cX},${cY - upDist}  ${cX + d1},${
        cY - upDist + d1
      }`,
      `${cX - d2},${cY + d2}           ${cX},${cY}           ${cX + d2},${
        cY + d2
      }`,
      `${cX - d3},${cY + upDist + d3}  ${cX},${cY + upDist}  ${cX + d3},${
        cY + upDist + d3
      }`,
    ],
    down: [
      `${cX - d1},${cY - downDist}  ${cX},${cY - downDist + d1}  ${cX + d1},${
        cY - downDist
      }`,
      `${cX - d2},${cY}             ${cX},${cY + d2}             ${
        cX + d2
      },${cY}`,
      `${cX - d3},${cY + downDist}  ${cX},${cY + downDist + d3}  ${cX + d3},${
        cY + downDist
      }`,
    ],
    straight: [
      `${cX - d1},${cY - downDist}  ${cX},${cY - downDist}  ${cX + d1},${
        cY - downDist
      }`,
      `${cX - d2},${cY}             ${cX},${cY}             ${cX + d2},${cY}`,
      `${cX - d3},${cY + downDist}  ${cX},${cY + downDist}  ${cX + d3},${
        cY + downDist
      }`,
    ],
  };
}

export function horizontalChevrons(
  cX: number,
  cY: number,
): { left: string[]; right: string[]; straight: string[] } {
  const d1 = 4;
  const d2 = 5.8;
  const d3 = 7.5;
  const ldist = 4.1; // small -> medium -> large
  const rdist = 6; // large -> medium -> small
  return {
    left: [
      `${cX + ldist},${cY - d1}  ${cX + ldist - d1},${cY}  ${cX + ldist},${
        cY + d1
      }`,
      `${cX}        ,${cY - d2}  ${cX - d2}        ,${cY}  ${cX}        ,${
        cY + d2
      }`,
      `${cX - ldist},${cY - d3}  ${cX - ldist - d3},${cY}  ${cX - ldist},${
        cY + d3
      }`,
    ],
    right: [
      `${cX + rdist - d1},${cY - d1}  ${cX + rdist},${cY}  ${cX + rdist - d1},${
        cY + d1
      }`,
      `${cX - d2}        ,${cY - d2}  ${cX}        ,${cY}  ${cX - d2}        ,${
        cY + d2
      }`,
      `${cX - rdist - d3},${cY - d3}  ${cX - rdist},${cY}  ${cX - rdist - d3},${
        cY + d3
      }`,
    ],
    straight: [
      `${cX + ldist},${cY - d1}  ${cX + ldist},${cY}  ${cX + ldist},${cY + d1}`,
      `${cX}        ,${cY - d2}  ${cX}        ,${cY}  ${cX}        ,${cY + d2}`,
      `${cX - ldist},${cY - d3}  ${cX - ldist},${cY}  ${cX - ldist},${cY + d3}`,
    ],
  };
}

export function colorString(val: string | null): string {
  return val ? (val.startsWith('#') ? val : `#${val}`) : '';
}

export function containerTransitions(
  [sizeX, sizeY]: [number, number],
  color?: string,
): Transitions {
  const coords = Array(sizeX * sizeY)
    .fill(0)
    .map((_, n) => {
      const outFlow = new Coordinates({
        x: (n % sizeX) + 0.5,
        y: Math.floor(n / sizeX) + 0.5,
        z: 0,
      });
      const inFlow = new Coordinates({
        x: (n % sizeX) + 0.1,
        y: Math.floor(n / sizeX) + 0.1,
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
        liquids: color ? [color] : [],
        source: true,
      },
    ];
  });

  return result;
}

export function coord2grid(val: number): number {
  return val * SQUARE_SIZE;
}

export function grid2coord(val: number): number {
  return Math.round(val / SQUARE_SIZE);
}

export function textTransformation(
  part: PersistentPart,
  textSize: [number, number],
  counterRotate = true,
): string {
  const [sizeX] = rotatedSize(part.rotate, textSize);
  const transforms: string[] = [];
  if (part.flipped) {
    transforms.push(`translate(${coord2grid(sizeX)}, 0) scale(-1,1)`);
  }
  if (part.rotate && counterRotate) {
    transforms.push(
      `rotate(${-part.rotate},${coord2grid(0.5 * textSize[0])},${coord2grid(
        0.5 * textSize[1],
      )})`,
    );
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
      component: 'ConfirmDialog',
      componentProps: {
        title: 'Broken Link',
        message: `Block '${addr.id}' was not found. Use the editor to change the link.`,
        cancel: false,
      },
    });
  }
}

export function showSettingsBlock(
  part: PersistentPart,
  settingsKey: string,
  intf: ComparedBlockType,
): void {
  const block = settingsBlock(part, settingsKey, intf);
  block !== null
    ? createBlockDialog(block, { mode: 'Basic' })
    : showAbsentBlock(part, settingsKey);
}

export function showDrivingBlockDialog(
  part: PersistentPart,
  settingsKey: string,
  intf: ComparedBlockType,
): void {
  const sparkStore = useSparkStore();
  const block = settingsBlock(part, settingsKey, intf);

  if (!block) {
    return showAbsentBlock(part, settingsKey);
  }

  const driveChain = sparkStore
    .driveChainsByService(block.serviceId)
    .find((chain) => chain.target === block.id);

  const actual =
    driveChain !== undefined
      ? sparkStore.blockById(block.serviceId, driveChain.source)
      : block;

  if (actual) {
    createBlockDialog(actual, { mode: 'Basic' });
  }
}

export function showLinkedWidgetDialog(
  part: PersistentPart,
  key: string,
): void {
  const widgetStore = useWidgetStore();
  const widgetId = part.settings[key];
  if (!widgetId) {
    return;
  } else if (widgetStore.widgetIds.includes(widgetId)) {
    createDialog({
      component: 'WidgetDialog',
      componentProps: {
        mode: 'Basic',
        widgetId,
      },
    });
  } else {
    createDialog({
      component: 'ConfirmDialog',
      componentProps: {
        title: 'Broken Link',
        message: 'Widget was not found. Use the editor to change the link.',
        cancel: false,
      },
    });
  }
}

export function universalTransitions(
  size: [number, number],
  enabled: boolean,
): Transitions {
  if (!enabled) {
    return {};
  }
  const [sizeX, sizeY] = size;
  const coords: string[] = [
    range(sizeX).map((x) => [`${x + 0.5},0,0`, `${x + 0.5},${sizeY},0`]),
    range(sizeY).map((y) => [`0,${y + 0.5},0`, `${sizeX},${y + 0.5},0`]),
  ].flat(2);
  return coords.reduce(
    (acc, coord) => {
      acc[coord] = [{ outCoords: CENTER, internal: true, friction: 0.5 }];
      return acc;
    },
    { [CENTER]: coords.map((outCoords) => ({ outCoords, friction: 0.5 })) },
  );
}

export function vivifyParts(
  parts: PersistentPart[] | null | undefined,
): PersistentPart[] {
  if (!parts) {
    return [];
  }
  const builderStore = useBuilderStore();
  const sizes: Mapped<number> = {};
  return (
    parts
      .map((storePart) => {
        const part: PersistentPart = { ...storePart };
        defaults(part, {
          rotate: 0,
          settings: {},
          flipped: false,
        });
        part.id = part.id ?? nanoid();
        part.type = deprecatedTypes[part.type] ?? part.type;

        const [sizeX, sizeY] = builderStore.spec(part).size(part);
        sizes[part.id] = sizeX * sizeY;
        return part;
      })
      // Sort parts to render largest first
      // This improves clickability of overlapping parts
      .sort((a, b) => sizes[b.id] - sizes[a.id])
  );
}

export function rotatedCoord(part: StatePart, coord: CoordinatesParam): string {
  return new Coordinates(coord)
    .flipShapeEdge(!!part.flipped, 0, part.size)
    .rotateShapeEdge(part.rotate, 0, part.size)
    .toString();
}

export function liquidOnCoord(part: FlowPart, coord: string): string[] {
  const flows = part.flows[rotatedCoord(part, coord)];
  return flows ? Object.keys(flows) : [];
}

export function flowOnCoord(part: FlowPart, coord: string): number {
  const flows = part.flows[rotatedCoord(part, coord)];
  return flows ? reduce(flows, (sum, v) => sum + v, 0) : 0;
}

export async function startAddLayout(
  source: BuilderLayout | null = null,
): Promise<string | null> {
  const title = await createDialogPromise({
    component: 'InputDialog',
    componentProps: {
      modelValue: 'Brewery Layout',
      title: 'Add Layout',
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
    order: builderStore.layouts.length + 1,
  });
  return id;
}

export function startChangeLayoutTitle(layout: BuilderLayout | null): void {
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
