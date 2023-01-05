import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress, ComparedBlockType } from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils/info';
import { useWidgetStore } from '@/store/widgets';
import { createBlockDialog } from '@/utils/block-dialog';
import { Coordinates, CoordinatesParam } from '@/utils/coordinates';
import { createDialog, createDialogPromise } from '@/utils/dialog';
import { deepCopy } from '@/utils/objects';
import { Block } from 'brewblox-proto/ts';
import defaults from 'lodash/defaults';
import isObject from 'lodash/isObject';
import range from 'lodash/range';
import reduce from 'lodash/reduce';
import { nanoid } from 'nanoid';
import { Router } from 'vue-router';
import {
  CENTER,
  DEFAULT_LAYOUT_HEIGHT,
  DEFAULT_LAYOUT_WIDTH,
  deprecatedTypes,
  DEPRECATED_SCALE_KEY,
  HEIGHT_KEY,
  SQUARE_SIZE,
  WIDTH_KEY,
} from './const';
import { useBuilderStore } from './store';
import {
  BuilderBlueprint,
  BuilderLayout,
  FlowPart,
  PartSize,
  PersistentPart,
  StatePart,
  Transitions,
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

export function settingsAddress(
  part: PersistentPart,
  key: string,
): BlockAddress {
  const obj = settingsProp(part.settings, key, isObject) ?? {};
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
  const { transitions, size, flows, ...persistent } = part as FlowPart;
  void { transitions, size, flows };
  return persistent;
}

export function asStatePart(part: PersistentPart): StatePart {
  const blueprint = useBuilderStore().blueprintByType(part.type);
  return {
    ...part,
    transitions: blueprint.transitions(part),
    size: blueprint.size(part),
  };
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
  [width, height]: PartSize,
  color?: string,
): Transitions {
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
  part: PersistentPart,
  [textWidth, textHeight]: PartSize,
  counterRotate = true,
): string {
  const transforms: string[] = [];
  if (part.flipped) {
    transforms.push(`translate(${coord2grid(textWidth)}, 0) scale(-1,1)`);
  }
  if (part.rotate && counterRotate) {
    const originX = coord2grid(0.5 * textWidth);
    const originY = coord2grid(0.5 * textHeight);
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

export function showPartBlockDialog(
  part: PersistentPart,
  settingsKey: string,
  intf: ComparedBlockType,
): void {
  // const sparkStore = useSparkStore();
  const block = settingsBlock(part, settingsKey, intf);

  if (!block) {
    return showAbsentBlock(part, settingsKey);
  }

  if (block) {
    createBlockDialog(block, { mode: 'Basic' });
  }
}

export function showLinkedWidgetDialog(
  part: PersistentPart,
  key: string,
): void {
  const widgetStore = useWidgetStore();
  const widgetId = settingsProp<string>(part.settings, key, 'string');
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
  [width, height]: PartSize,
  enabled: boolean,
): Transitions {
  if (!enabled) {
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

export function variableSizeFunc(defaults: AreaSize): BuilderBlueprint['size'] {
  return ({ settings }) => {
    const width = settingsProp<number>(settings, WIDTH_KEY, 'number');
    const height = settingsProp<number>(settings, HEIGHT_KEY, 'number');
    if (width || height) {
      return [width || defaults.width, height || defaults.height];
    }
    // backwards compatibility with deprecated setting
    if (settings[DEPRECATED_SCALE_KEY] != null) {
      const scale = Number(settings[DEPRECATED_SCALE_KEY]);
      return [defaults.width * scale, defaults.height * scale];
    }
    return [defaults.width, defaults.height];
  };
}

export function vivifyParts(
  parts: PersistentPart[] | null | undefined,
): PersistentPart[] {
  if (!parts) {
    return [];
  }
  const builderStore = useBuilderStore();
  const surfaceArea: Mapped<number> = {};
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

        const [width, height] = builderStore
          .blueprintByType(part.type)
          .size(part);
        surfaceArea[part.id] = width * height;
        return part;
      })
      // Sort parts to render largest first
      // This improves clickability of overlapping parts
      .sort((a, b) => surfaceArea[b.id] - surfaceArea[a.id])
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

export function liquidBorderColor(part: FlowPart): string {
  for (const coord in part.flows) {
    const flow = part.flows[coord];
    for (const color in flow) {
      if (flow[color] != 0) {
        return color;
      }
    }
  }
  return '';
}

export function flowOnCoord(part: FlowPart, coord: string): number {
  const flows = part.flows[rotatedCoord(part, coord)];
  return flows ? reduce(flows, (sum, v) => sum + v, 0) : 0;
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
