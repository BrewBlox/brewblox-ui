<script lang="ts">
import { debounce, uid } from 'quasar';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { Coordinates } from '@/helpers/coordinates';
import { createDialog } from '@/helpers/dialog';
import { showImportDialog } from '@/helpers/dialog';
import { clampRotation } from '@/helpers/functional';
import { saveFile } from '@/helpers/import-export';
import { deepCopy, deserialize, serialize } from '@/helpers/units/parseObject';
import { dashboardStore } from '@/store/dashboards';

import BuilderCatalog from './BuilderCatalog.vue';
import BuilderPartMenu from './BuilderPartMenu.vue';
import { calculateNormalizedFlows } from './calculateFlows';
import { defaultLayoutHeight, defaultLayoutWidth, deprecatedTypes, SQUARE_SIZE } from './getters';
import { asPersistentPart, asStatePart } from './helpers';
import { builderStore } from './store';
import { BuilderItem, BuilderLayout, ClickEvent, FlowPart, PartUpdater, PersistentPart, Rect } from './types';

interface Floater extends XYPosition {
  parts: PersistentPart[];
}

interface SelectArea extends XYPosition {
  width: number;
  height: number;
}

interface UserAction {
  label: string;
  value: string;
  icon: string;
  shortcut: string;
}

interface ToolAction extends UserAction {
  cursor: (part: FlowPart) => boolean;
  onClick?: (evt: ClickEvent, part: FlowPart) => void;
  onPan?: (args: PanArguments, part: FlowPart) => void;
}

interface SingleAction extends UserAction {
  onActivate: (parts: FlowPart[]) => void;
}

@Component({
  components: {
    BuilderCatalog,
    BuilderPartMenu,
  },
})
export default class BuilderEditor extends DialogBase {

  @Ref()
  readonly grid!: any;

  layoutId: string | null = null;
  debouncedCalculate: Function = () => { };
  flowParts: FlowPart[] = [];
  history: string[] = [];

  menuDialogOpen = false;

  selectedTime = 0;
  selectArea: SelectArea | null = null;
  selectDragDelta: XYPosition | null = null
  floatingSelection = false;
  selectedParts: FlowPart[] = [];
  hoverPos: XYPosition | null = null;

  floater: Floater | null = null;
  configuredPartId: string | null = null;

  updater: PartUpdater = {
    updatePart: this.savePart,
  };

  tools: ToolAction[] = [
    {
      label: 'Select',
      value: 'select',
      icon: 'mdi-select-drag',
      shortcut: 's',
      cursor: part => !!part,
      onPan: this.selectPanHandler,
      onClick: this.selectClickHandler,
    },
    {
      label: 'Interact (Click)',
      value: 'interact',
      icon: 'mdi-cursor-default',
      shortcut: 'i',
      cursor: part => !!part && !!builderStore.spec(part).interactHandler,
      onClick: this.interactClickHandler,
    },
  ];

  singles: SingleAction[] = [
    {
      label: 'New',
      value: 'add',
      icon: 'add',
      shortcut: 'n',
      onActivate: this.startAddPart,
    },
    {
      label: 'Move',
      value: 'move',
      icon: 'mdi-cursor-move',
      shortcut: 'm',
      onActivate: this.startMove,
    },
    {
      label: 'Copy',
      value: 'copy',
      icon: 'file_copy',
      shortcut: 'c',
      onActivate: this.startCopy,
    },
    {
      label: 'Rotate',
      value: 'rotate-right',
      icon: 'mdi-rotate-right-variant',
      shortcut: 'r',
      onActivate: this.startRotate,
    },
    {
      label: 'Flip',
      value: 'flip',
      icon: 'mdi-swap-horizontal-bold',
      shortcut: 'f',
      onActivate: this.startFlip,
    },
    {
      label: 'Edit Settings',
      value: 'config',
      icon: 'settings',
      shortcut: 'e',
      onActivate: this.startEdit,
    },
    {
      label: 'Delete',
      value: 'delete',
      icon: 'delete',
      shortcut: 'd',
      onActivate: this.startDelete,
    },
  ]

  @Prop({ type: String })
  public readonly initialLayout!: string | null;

  get editorActive(): boolean {
    return builderStore.editorActive;
  }

  get layouts(): BuilderLayout[] {
    return builderStore.layoutValues;
  }

  get layout(): BuilderLayout | null {
    return builderStore.layoutById(
      this.layoutId
      || this.initialLayout
      || builderStore.layoutIds[0]
      || '');
  }

  get parts(): PersistentPart[] {
    if (!this.layout) {
      return [];
    }
    const sizes: Record<string, number> = {};
    return this.layout.parts
      .map(part => {
        const actual: PersistentPart = {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          ...part,
          type: deprecatedTypes[part.type] || part.type,
        };
        const [sizeX, sizeY] = builderStore.spec(actual).size(actual);
        sizes[part.id] = sizeX * sizeY;
        return actual;
      })
      // sort parts to render largest first
      .sort((a, b) => sizes[b.id] - sizes[a.id]);
  }

  get configuredPart(): FlowPart | null {
    return this.flowParts.find(p => p.id === this.configuredPartId) || null;
  }

  get overlaps(): [Coordinates, number][] {
    const counts: Record<string, number> = {};
    for (const part of this.parts) {
      const key = new Coordinates([part.x, part.y, 0]).toString();
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 1)
      .map(([k, v]) => [new Coordinates(k), v] as [Coordinates, number]);
  }

  get currentTool(): ToolAction {
    const toolId = builderStore.editorTool;
    return this.tools.find(tool => tool.value === toolId) || this.tools[0];
  }

  set currentTool(tool: ToolAction) {
    builderStore.commitEditorTool(tool.value);
  }

  async saveLayout(layout: BuilderLayout | null = this.layout): Promise<void> {
    if (layout === null) { return; }
    if (layout.id) {
      await builderStore.saveLayout(layout);
    } else {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.layoutId = id;
    }
  }

  async saveParts(parts: PersistentPart[], saveHistory = true): Promise<void> {
    if (!this.layout) {
      return;
    }

    if (saveHistory) {
      const stored = builderStore.layoutById(this.layout.id);
      if (stored) {
        this.history.push(JSON.stringify(serialize(stored.parts)));
      }
    }

    // first set local value, to avoid jitters caused by the period between action and VueX refresh
    this.layout.parts = parts.map(asPersistentPart);
    this.debouncedCalculate();
    await this.saveLayout(this.layout);
  }

  async savePart(part: PersistentPart): Promise<void> {
    await this.saveParts(this.parts.map(p => (p.id === part.id ? part : p)));
  }

  async addPart(part: PersistentPart): Promise<void> {
    await this.saveParts([...this.parts, part]);
  }

  async removePart(part: PersistentPart): Promise<void> {
    await this.saveParts(this.parts.filter(p => p.id !== part.id));
  }

  async undo(): Promise<void> {
    if (this.history.length > 0) {
      this.cancelSelection();
      const parts = deserialize(JSON.parse(this.history.pop() as string));
      await this.saveParts(parts, false);
    }
  }

  async importLayout(): Promise<void> {
    showImportDialog<BuilderLayout>(async layout => {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.layoutId = id;
    });
  }

  exportLayout(): void {
    if (!this.layout) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, ...exported } = this.layout;
    saveFile(exported, `brewblox-${this.layout.title}-layout.json`);
  }

  renameLayout(): void {
    if (!this.layout) {
      return;
    }
    createDialog({
      title: 'Change Layout title',
      message: `Choose a new name for ${this.layout.title}`,
      dark: true,
      cancel: true,
      prompt: {
        model: this.layout.title,
        type: 'text',
      },
    })
      .onOk(async title => {
        if (this.layout) {
          builderStore.saveLayout({ ...this.layout, title });
        }
      });
  }

  clearParts(): void {
    createDialog({
      title: 'Remove parts',
      message: 'Are you sure you wish to remove all parts?',
      dark: true,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(() => this.saveParts([]));
  }

  removeLayout(): void {
    if (!this.layout) {
      return;
    }
    createDialog({
      title: 'Remove layout',
      message: `Are you sure you wish to remove ${this.layout.title}?`,
      dark: true,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(async () => {
        if (this.layout) {
          await builderStore.removeLayout(this.layout)
            .catch(() => { });
        }
        this.layoutId = this.layouts.length > 0
          ? this.layouts[0].id
          : null;
      });
  }

  createLayoutWidget(): void {
    if (!this.layout) { return; }

    createDialog({
      parent: this,
      title: 'Copy widget',
      message: `On which dashboard do you want to create a widget for ${this.layout.title}?`,
      dark: true,
      options: {
        type: 'radio',
        model: undefined,
        items: dashboardStore.dashboardValues
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk(async (dashboard: string) => {
        const layout = this.layout!;
        const widget: BuilderItem = {
          id: uid(),
          title: layout.title,
          order: 0,
          dashboard,
          feature: 'Builder',
          cols: Math.max(2, Math.ceil(layout.width * (50 / 120))),
          rows: Math.max(2, Math.ceil(layout.height * (50 / 120))),
          config: {
            currentLayoutId: layout.id,
            layoutIds: [layout.id],
          },
        };
        await dashboardStore.appendPersistentWidget(widget);
        this.$q.notify({
          color: 'positive',
          icon: 'file_copy',
          message: `Created ${layout.title} widget on ${dashboardStore.dashboardById(dashboard).title}`,
        });
      });
  }

  startAddLayout(copy: boolean): void {
    createDialog({
      title: 'Add Layout',
      message: 'Create a new Brewery Builder layout',
      dark: true,
      cancel: true,
      prompt: {
        model: 'Brewery Layout',
        type: 'text',
      },
    })
      .onOk(async title => {
        const id = uid();
        await builderStore.createLayout({
          id,
          title,
          width: copy && this.layout ? this.layout.width : defaultLayoutWidth,
          height: copy && this.layout ? this.layout.height : defaultLayoutHeight,
          parts: copy && this.layout ? deepCopy(this.layout.parts) : [],
        });
        this.layoutId = id;
      });
  }

  async calculate(): Promise<void> {
    await this.$nextTick();
    this.updateFlowParts(calculateNormalizedFlows(this.parts.map(asStatePart)));
  }

  gridRect(): Rect {
    const { x, y, left, right, top, bottom } = this.grid.getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  isClickable(part): boolean {
    return !!builderStore.spec(part).interactHandler;
  }

  interact(part: FlowPart): void {
    const handler = builderStore.spec(part).interactHandler;
    handler && handler(part, this.updater);
  }

  squares(val: number): number {
    return SQUARE_SIZE * val;
  }

  clickHandler(evt: ClickEvent, part: FlowPart): void {
    if (this.floater) {
      const pos = this.findClickSquare(evt);
      if (pos) {
        const ids: string[] = [];

        this.floater.parts
          .forEach(part => {
            ids.push(part.id);
            part.x += this.floater!.x;
            part.y += this.floater!.y;
          });

        this.saveParts([
          ...this.parts.filter(p => !ids.includes(p.id)),
          ...this.floater.parts,
        ]);
      }

      this.selectedParts = [];
      this.floater = null;
    }
    else if (this.currentTool.onClick) {
      this.currentTool.onClick(evt, part);
    }

    evt.stopPropagation();
  }

  keyHandler(evt: KeyboardEvent): void {
    if (this.menuDialogOpen) {
      return;
    }

    // Capture escape key
    if (evt.keyCode === 27) {
      this.clear();
      return;
    }

    const key = evt.key.toLowerCase();

    if (evt.ctrlKey && key === 'z') {
      this.undo();
      return;
    }

    const tool = this.tools.find(t => t.shortcut === key);
    if (tool) {
      this.currentTool = tool;
      evt.stopPropagation();
      return;
    }

    const single = this.singles.find(t => t.shortcut === key);
    if (single) {
      single.onActivate(this.findActionParts());
      evt.stopPropagation();
    }
  }

  panHandler(args: PanArguments, part: FlowPart): void {
    if (this.currentTool.onPan) {
      this.currentTool.onPan(args, part);
    }
    args.evt.stopPropagation();
  }

  rectContains(rect: Rect, x: number, y: number): boolean {
    return x >= rect.left
      && x <= rect.right
      && y >= rect.top
      && y <= rect.bottom;
  }

  findGridSquare(rawPos: XYPosition | null): XYPosition | null {
    // The page offset in clicks has appeared and disappeared in various quasar releases
    // Comment or uncomment these lines when required
    // x -= window.pageXOffset;
    // y -= window.pageYOffset;
    if (rawPos === null) { return null; }
    const grid = this.gridRect();
    const { x, y } = rawPos;
    if (!this.rectContains(grid, x, y)) {
      return null;
    }
    return {
      x: Math.floor((x - grid.x) / SQUARE_SIZE),
      y: Math.floor((y - grid.y) / SQUARE_SIZE),
    };
  }

  findClickSquare(evt: ClickEvent): XYPosition | null {
    const pos = (evt instanceof MouseEvent)
      ? { x: evt.clientX, y: evt.clientY }
      : { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    return this.findGridSquare(pos);
  }


  findPartAtPos(pos: XYPosition | null): FlowPart | null {
    if (!pos) { return null; }
    // iterate right to left to match rendering order
    // when items overlap, the later item is rendered on top
    for (let idx = this.flowParts.length - 1; idx >= 0; idx--) {
      const part = this.flowParts[idx];
      if (pos.x >= part.x
        && pos.x <= part.x + part.size[0]
        && pos.y >= part.y
        && pos.y <= part.y + part.size[1]) {
        return part;
      }
    }
    return null;
  }

  findActionParts(): FlowPart[] {
    if (this.selectedParts.length) {
      return this.selectedParts;
    }
    const hovered = this.findPartAtPos(this.findGridSquare(this.hoverPos));
    return hovered
      ? [hovered]
      : [];
  }

  unflippedArea(area: SelectArea): SelectArea {
    return {
      x: area.width >= 0 ? area.x : area.x + area.width,
      y: area.height >= 0 ? area.y : area.y + area.height,
      width: Math.abs(area.width),
      height: Math.abs(area.height),
    };
  }

  selectPanHandler(args: PanArguments): void {
    if (args.isFirst) {
      const grid = this.gridRect();
      this.selectArea = {
        x: args.position.left - grid.x,
        y: args.position.top - grid.y,
        width: 0,
        height: 0,
      };
    }

    if (this.selectArea) {
      const { x, y } = args.delta;
      this.selectArea.width += x;
      this.selectArea.height += y;
    }

    if (args.isFinal && this.selectArea) {
      const { x, y, width, height } = this.unflippedArea(this.selectArea);
      const startX = x / SQUARE_SIZE;
      const startY = y / SQUARE_SIZE;
      const endX = startX + (width / SQUARE_SIZE);
      const endY = startY + (height / SQUARE_SIZE);

      const ids = this.selectedParts.map(part => part.id);

      this.selectedParts.push(
        ...this.flowParts
          .filter(part =>
            !ids.includes(part.id)
            && part.x >= startX - 1
            && part.x <= endX
            && part.y >= startY - 1
            && part.y <= endY)
          .map(deepCopy));

      this.selectArea = null;
      this.selectedTime = new Date().getTime();
    }
  }

  // moveSelectedPanHandler(args: PanArguments, copy: boolean): void {
  //   if (args.isFirst) {
  //     this.selectDragDelta = { x: 0, y: 0 };
  //   }

  //   if (!this.selectDragDelta) {
  //     return;
  //   }

  //   const prevDelta = { ...this.selectDragDelta };

  //   this.selectDragDelta.x += args.delta.x;
  //   this.selectDragDelta.y += args.delta.y;

  //   const snapDeltaPrev = {
  //     x: Math.ceil(prevDelta.x / SQUARE_SIZE),
  //     y: Math.ceil(prevDelta.y / SQUARE_SIZE),
  //   };
  //   const snapDelta = {
  //     x: Math.ceil(this.selectDragDelta.x / SQUARE_SIZE),
  //     y: Math.ceil(this.selectDragDelta.y / SQUARE_SIZE),
  //   };

  //   if (snapDeltaPrev.x !== snapDelta.x || snapDeltaPrev.y !== snapDelta.y) {
  //     // We want to snap to grid during the move
  //     // Subtract the previous values to avoid drift
  //     this.selectedParts
  //       .forEach(part => {
  //         part.x = part.x + snapDelta.x - snapDeltaPrev.x;
  //         part.y = part.y + snapDelta.y - snapDeltaPrev.y;
  //       });
  //   }

  //   if (args.isFinal) {
  //     this.selectedTime = new Date().getTime();

  //     // Now also snap select area to grid
  //     const snapDelta = {
  //       x: Math.ceil(this.selectDragDelta.x / SQUARE_SIZE) * SQUARE_SIZE,
  //       y: Math.ceil(this.selectDragDelta.y / SQUARE_SIZE) * SQUARE_SIZE,
  //     };
  //     this.selectDragDelta = null;

  //     if (snapDelta.x === 0 && snapDelta.y === 0) {
  //       return;
  //     }

  //     if (copy) {
  //       this.selectedParts.forEach(p => p.id = uid());
  //       this.saveParts([...this.parts, ...this.selectedParts]);
  //     } else {
  //       const ids = this.selectedParts.map(part => part.id);
  //       this.saveParts([...this.parts.filter(p => !ids.includes(p.id)), ...this.selectedParts]);
  //     }
  //   }
  // }

  cancelSelection(): void {
    this.selectedTime = 0;
    this.selectArea = null;
    this.selectedParts = [];
  }

  selectClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (new Date().getTime() - this.selectedTime < 500) {
      // The mouseup at the end of a pan also generates a click event - skip this
      return;
    }

    if (!part) {
      this.cancelSelection();
      return;
    }

    const selectedIdx = this.selectedParts.findIndex(p => p.id === part.id);
    if (selectedIdx >= 0) {
      this.selectedParts.splice(selectedIdx, 1);
    } else {
      this.selectedParts.push(deepCopy(part));
    }
  }

  // movePanHandler(args: PanArguments, part: FlowPart, copy = false): void {
  //   if (this.selectedParts.length) {
  //     return this.moveSelectedPanHandler(args, copy);
  //   }

  //   if (!part) {
  //     return;
  //   }

  //   if (args.isFirst) {
  //     this.floater = {
  //       part,
  //       x: 0,
  //       y: 0,
  //     };
  //   }

  //   const grid = this.gridRect();

  //   if (this.floater !== null) {
  //     this.floater.x = args.position.left - (0.5 * SQUARE_SIZE) - grid.x;
  //     this.floater.y = args.position.top - (0.5 * SQUARE_SIZE) - grid.y;
  //   }

  //   if (args.isFinal) {
  //     const gridPos = this.findGridSquare(grid, args.position.left, args.position.top);
  //     if (gridPos) {
  //       const from = copy ? null : part;
  //       const id = copy ? uid() : part.id;
  //       this.movePart(from, { ...deepCopy(part), ...gridPos, id })
  //         .then(() => this.$nextTick())
  //         .then(() => this.floater = null);
  //     } else {
  //       this.floater = null;
  //     }
  //   }
  // }

  // copyClickHandler(evt: ClickEvent, part: FlowPart): void {
  //   if (!part && !this.floater) { return; };

  //   const pos = this.findClickSquare(evt);

  //   if (this.floater) {
  //     if (pos) {
  //       const { x, y } = pos;
  //       this.addPart({ ...this.floater.part, id: uid(), x, y });
  //     }
  //     this.floater = null;
  //     return;
  //   }

  //   if (part) {
  //     this.floater = {
  //       part,
  //       x: 0,
  //       y: 0,
  //     };
  //   }
  // }

  // copyPanHandler(args: PanArguments, part: FlowPart): void {
  //   this.movePanHandler(args, part, true);
  // }

  // addPartClickHandler(evt: ClickEvent): void {
  //   const pos = this.findClickSquare(evt);
  //   if (pos && this.floater) {
  //     const { x, y } = pos;
  //     this.addPart({ ...this.floater.part, id: uid(), x, y });
  //     this.floater = null;
  //   }
  // }

  // configurePartClickHandler(evt: ClickEvent, part: FlowPart): void {
  //   if (part) {
  //     this.configuredPartId = part.id;
  //     this.menuDialogOpen = true;
  //   }
  // }

  interactClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (part) {
      const handler = builderStore.spec(part).interactHandler;
      handler && handler(part, this.updater);
    }
  }

  // rotateClickHandler(evt: ClickEvent, part: FlowPart, rotation = 90): void {
  //   if (part) {
  //     const rotate = clampRotation(part.rotate + rotation);
  //     this.savePart({ ...part, rotate });
  //   }
  // }

  // flipClickHandler(evt: ClickEvent, part: FlowPart): void {
  //   if (part) {
  //     this.savePart({ ...part, flipped: !part.flipped });
  //   }
  // }

  ////////////////////////////////////////////////////////////////
  // Single Actions
  ////////////////////////////////////////////////////////////////

  startAddPart(): void {
    createDialog({
      parent: this,
      component: BuilderCatalog,
    })
      .onOk((part: PersistentPart) => {
        this.floater = {
          x: 0,
          y: 0,
          parts: [part],
        };
      });
  }

  startMove(parts: FlowPart[]): void {
    if (parts.length) {
      const minX = Math.min(...parts.map(part => part.x));
      const minY = Math.min(...parts.map(part => part.y));
      const startPos = this.hoverPos || { x: 0, y: 0 };
      this.floater = {
        ...startPos,
        parts: parts.map(part => ({
          ...deepCopy(part),
          x: part.x - minX,
          y: part.y - minY,
        })),
      };
    }
  }

  startCopy(parts: FlowPart[]): void {
    if (parts.length) {
      const minX = Math.min(...parts.map(part => part.x));
      const minY = Math.min(...parts.map(part => part.y));
      const startPos = this.hoverPos || { x: 0, y: 0 };
      this.floater = {
        ...startPos,
        parts: parts.map(part => ({
          ...deepCopy(part),
          id: uid(),
          x: part.x - minX,
          y: part.y - minY,
        })),
      };
    }
  }

  startRotate(parts: FlowPart[]): void {
    if (parts.length === 1) {
      const [part] = parts;
      const rotate = clampRotation(part.rotate + 90);
      this.savePart({ ...part, rotate });
    }
  }

  startFlip(parts: FlowPart[]): void {
    if (parts.length === 1) {
      const [part] = parts;
      this.savePart({ ...part, flipped: !part.flipped });
    }
  }

  startEdit(parts: FlowPart[]): void {
    if (parts.length === 1) {
      this.configuredPartId = parts[0].id;
      this.menuDialogOpen = true;
    }
  }

  startDelete(parts: FlowPart[]): void {
    if (parts.length) {
      const ids = this.selectedParts.map(p => p.id);
      this.saveParts([...this.parts.filter(p => !ids.includes(p.id))]);
      this.cancelSelection();
    }
  }

  async movePart(from: PersistentPart | null, to: PersistentPart): Promise<void> {
    if (from
      && from.id === to.id
      && from.x === to.x
      && from.y === to.y) {
      return;
    }

    await this.saveParts([...this.parts.filter(p => !from || p.id !== from.id), to]);
  }

  isBusy(part: PersistentPart): boolean {
    return (!!this.floater && this.floater.parts.some(p => p.id === part.id))
      || this.selectedParts.some(p => p.id === part.id);
  }

  onGridMove(evt: MouseEvent): void {
    this.hoverPos = { x: evt.pageX, y: evt.pageY };
    if (this.floater) {
      const pos = this.findGridSquare(this.hoverPos);
      if (pos) {
        this.floater.x = pos.x;
        this.floater.y = pos.y;
      }
    }
  }

  onGridLeave(): void {
    this.hoverPos = null;
  }

  updateFlowParts(parts: FlowPart[]): void {
    this.flowParts = parts;
    if (this.selectedParts.length > 0) {
      const selectedIds = this.selectedParts.map(p => p.id);
      this.selectedParts = this.flowParts
        .filter(p => selectedIds.includes(p.id))
        .map(deepCopy);
    }
  }

  clear(): void {
    this.floater = null;
  }

  created(): void {
    builderStore.commitEditorActive(true);
    window.addEventListener('keyup', this.keyHandler);
    this.debouncedCalculate = debounce(this.calculate, 150, false);
    this.debouncedCalculate();
  }

  mounted(): void {
    this.$nextTick(() => {
      if (this.grid !== undefined) {
        this.grid.addEventListener('mousemove', this.onGridMove);
        this.grid.addEventListener('mouseleave', this.onGridLeave);
      }
    });
  }

  destroyed(): void {
    window.removeEventListener('keyup', this.keyHandler);
    builderStore.commitEditorActive(false);
  }

  @Watch('layout')
  watchLayout(newV: BuilderLayout, oldV: BuilderLayout): void {
    if (newV === null || (oldV !== null && oldV.id !== newV.id)) {
      this.history = [];
    }
    this.debouncedCalculate();
  }

  @Watch('editorActive')
  watchActive(active): void {
    // A workaround for a hot reloading bug
    // where the editor is not destroyed when the dialog closes
    if (!active) {
      this.onDialogHide();
    }
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized no-esc-dismiss @hide="onDialogHide">
    <q-card class="maximized bg-dark" dark>
      <DialogToolbar>
        <q-item-section>
          <q-item-label>Brewery Builder Editor</q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-dialog v-model="menuDialogOpen" no-backdrop-dismiss>
        <BuilderPartMenu
          v-if="menuDialogOpen"
          :part="configuredPart"
          @update:part="savePart"
          @remove:part="removePart"
          @dirty="debouncedCalculate"
          @close="menuDialogOpen = false"
        />
      </q-dialog>

      <q-card-section class="row no-wrap">
        <q-list v-if="!!layout" dark bordered class="col-auto scroll">
          <q-expansion-item label="Modes" header-class="text-h6" default-opened>
            <q-separator dark inset />
            <ActionItem
              v-for="tool in tools"
              :key="tool.value"
              :active="currentTool.value === tool.value"
              :icon="tool.icon"
              :label="tool.label"
              no-close
              @click="currentTool = tool"
            >
              <q-item-section side class="text-uppercase">
                {{ tool.shortcut }}
              </q-item-section>
            </ActionItem>
          </q-expansion-item>

          <q-expansion-item label="Tools" header-class="text-h6" default-opened>
            <q-separator dark inset />
            <ActionItem
              v-for="tool in singles"
              :key="tool.value"
              :icon="tool.icon"
              :label="tool.label"
              no-close
              @click="tool.onActivate(findActionParts())"
            >
              <q-item-section side class="text-uppercase">
                {{ tool.shortcut }}
              </q-item-section>
            </ActionItem>
          </q-expansion-item>

          <q-expansion-item label="Layout size" header-class="text-h6" default-opened>
            <q-separator dark inset />
            <q-item dark>
              <q-item-section>
                <q-item-label caption>
                  Width
                </q-item-label>
                <q-slider
                  :value="layout.width"
                  :min="5"
                  :max="50"
                  label
                  label-always
                  @change="v => { layout.width = v; saveLayout() }"
                />
              </q-item-section>
            </q-item>
            <q-item dark>
              <q-item-section>
                <q-item-label caption>
                  Height
                </q-item-label>
                <q-slider
                  :value="layout.height"
                  :min="5"
                  :max="50"
                  label
                  label-always
                  @change="v => { layout.height = v; saveLayout() }"
                />
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>

        <!-- Fills space not taken by the sidebar -->
        <div class="col row justify-center no-wrap">
          <div class="col-auto column no-wrap" style="max-height: 90vh">
            <!-- Layout dropdown -->
            <div class="row q-mb-sm">
              <q-btn-dropdown
                :label="layout ? layout.title : 'None'"
                flat
                no-caps
                icon="widgets"
                class="col"
              >
                <q-list dark bordered>
                  <ActionItem
                    v-for="lo in layouts"
                    :key="lo.id"
                    :label="lo.title"
                    :active="layout && lo.id === layout.id"
                    icon="mdi-view-dashboard-outline"
                    @click="layoutId = lo.id"
                  />
                </q-list>
              </q-btn-dropdown>
              <q-btn
                :disable="!history.length"
                flat
                icon="mdi-undo"
                class="col-auto"
                @click="undo"
              />
              <q-btn-dropdown flat icon="settings" class="col-auto">
                <q-list dark bordered>
                  <ActionItem label="New Layout" icon="add" @click="startAddLayout(false)" />
                  <template v-if="!!layout">
                    <ActionItem icon="file_copy" label="Copy Layout" @click="startAddLayout(true)" />
                    <ActionItem icon="mdi-file-import" label="Import Layout" @click="importLayout" />
                    <ActionItem icon="edit" label="Rename Layout" @click="renameLayout" />
                    <ActionItem icon="dashboard" label="Show Layout on dashboard" @click="createLayoutWidget" />
                    <ActionItem icon="mdi-file-export" label="Export Layout" @click="exportLayout" />
                    <ActionItem icon="delete" label="Delete all parts" @click="clearParts" />
                    <ActionItem icon="delete" label="Delete Layout" @click="removeLayout" />
                  </template>
                </q-list>
              </q-btn-dropdown>
            </div>
            <!-- Grid wrapper -->
            <div class="col column no-wrap scroll maximized">
              <div
                v-if="!!layout"
                v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, null)"
                :style="`
                width: ${squares(layout.width)}px;
                height: ${squares(layout.height)}px;`"
                class="q-mb-md"
              >
                <!-- No tools have a pan handler for non-part grid squares -->
                <svg
                  ref="grid"
                  class="grid-base grid-editable"
                  @click="v => clickHandler(v, null)"
                >
                  <text
                    v-for="x in layout.width"
                    :key="`edge-x-${x}`"
                    :x="squares(x-1)+20"
                    :y="8"
                    fill="white"
                    class="grid-square-text"
                  >{{ x-1 }}</text>
                  <text
                    v-for="y in layout.height"
                    :key="`edge-y-${y}`"
                    :x="0"
                    :y="squares(y-1)+28"
                    fill="white"
                    class="grid-square-text"
                  >{{ y-1 }}</text>
                  <g
                    v-for="part in flowParts"
                    v-show="!isBusy(part)"
                    :key="part.id"
                    v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, part)"
                    :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                    :class="{ clickable: currentTool.cursor(part), [part.type]: true }"
                    @click.stop="v => clickHandler(v, part)"
                  >
                    <PartWrapper
                      :part="part"
                      show-hover
                      @update:part="savePart"
                      @dirty="debouncedCalculate"
                    />
                  </g>
                  <g v-if="floater" :transform="`translate(${squares(floater.x)}, ${squares(floater.y)})`">
                    <g
                      v-for="part in floater.parts"
                      :key="`floating-${part.id}`"
                      :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                      :class="{ clickable: currentTool.cursor(part), [part.type]: true }"
                    >
                      <PartWrapper :part="part" selected />
                    </g>
                  </g>
                  <template v-else>
                    <g
                      v-for="part in selectedParts"
                      :key="`selected-${part.id}`"
                      :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                      :class="{ clickable: currentTool.cursor(part), [part.type]: true }"
                      @click.stop="v => clickHandler(v, part)"
                    >
                      <PartWrapper :part="part" selected />
                    </g>
                  </template>
                  <g
                    v-for="([coord, val], idx) in overlaps"
                    :key="idx"
                    :transform="`translate(${squares(coord.x) + 40}, ${squares(coord.y) + 4})`"
                  >
                    <circle r="8" fill="dodgerblue" />
                    <text
                      y="4"
                      text-anchor="middle"
                      fill="white"
                      class="grid-square-text"
                    >{{ val }}</text>
                  </g>
                  <rect
                    v-if="selectArea"
                    v-bind="unflippedArea(selectArea)"
                    stroke="white"
                    fill="dodgerblue"
                    opacity="0.3"
                    style="pointer-events: none;"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="stylus" scoped>
@import './grid.styl';
</style>
