import { BuilderMode, BuilderTool } from './types';

export const typeName = 'Builder';
export const defaultLayoutWidth = 20;
export const defaultLayoutHeight = 15;
export const SQUARE_SIZE = 50;
export const UP = '0.5,0,0';
export const RIGHT = '1,0.5,0';
export const DOWN = '0.5,1,0';
export const LEFT = '0,0.5,0';
export const CENTER = '0.5,0.5,0';
export const DEFAULT_FRICTION = 1;
export const DEFAULT_PUMP_PRESSURE = 30;
export const MIN_PUMP_PRESSURE = 5;
export const MAX_PUMP_PRESSURE = 100;
export const DEFAULT_IO_PRESSURE = 30;
export const MIN_IO_PRESSURE = 0;
export const MAX_IO_PRESSURE = 100;
export const COLD_WATER = '#4AA0EF';
export const HOT_WATER = '#DB0023';
export const BEER = '#E1AC00';
export const WORT = '#C78A49';

export const INNER_LINE = 21;
export const OUTER_LINE = 29;
export const LIQUID_LINE = 25;

export const INNER_CORNER = 4;
export const OUTER_CORNER = 12;
export const LIQUID_CORNER = 8;

// Generic settings values
export const SCALE_KEY = 'scale';
export const BORDER_KEY = 'bordered';

export const deprecatedTypes = {
  SmallKettle: 'Kettle',
  LargeKettle: 'Kettle',
  TallFridge: 'Fridge',
  PwmPump: 'Pump',
  ActuatorValve: 'Valve',
};

export const builderModes: BuilderMode[] = [
  {
    value: 'pan',
    label: 'Pan',
    icon: 'mdi-drag-variant',
    gridCursor: 'all-scroll',
    partClass: () => '',
    showHover: false,
  },
  {
    label: 'Select',
    value: 'select',
    icon: 'mdi-select-drag',
    gridCursor: 'crosshair',
    partClass: part => part != null ? 'pointer' : '',
    showHover: true,
  },
  {
    value: 'interact',
    label: 'Interact',
    icon: 'mdi-cursor-default',
    gridCursor: 'auto',
    partClass: part => part?.canInteract ? 'pointer' : '',
    showHover: true,
  },
  {
    value: 'gridsize',
    label: 'Resize grid',
    icon: 'mdi-grid',
    gridCursor: 'crosshair',
    partClass: () => '',
    showHover: false,
  },
];

export const builderTools: BuilderTool[] = [
  {
    value: 'add',
    label: 'New',
    icon: 'add',
    shortcut: 'n',
  },
  {
    value: 'move',
    label: 'Move',
    icon: 'mdi-cursor-move',
    shortcut: 'm',
  },
  {
    value: 'copy',
    label: 'Copy',
    icon: 'file_copy',
    shortcut: 'c',
  },
  {
    value: 'rotate',
    label: 'Rotate',
    icon: 'mdi-rotate-right-variant',
    shortcut: 'r',
  },
  {
    label: 'Flip',
    value: 'flip',
    icon: 'mdi-swap-horizontal-bold',
    shortcut: 'f',
  },
  {
    value: 'edit',
    label: 'Edit Settings',
    icon: 'settings',
    shortcut: 'e',
  },
  {
    label: 'Interact',
    value: 'interact',
    icon: 'mdi-cursor-default',
    shortcut: 'i',
  },
  {
    label: 'Delete',
    value: 'delete',
    icon: 'delete',
    shortcut: 'd',
  },
  {
    label: 'Undo',
    value: 'undo',
    icon: 'mdi-undo',
    shortcut: 'ctrl+z',
  },
  {
    label: 'Redo',
    value: 'redo',
    icon: 'mdi-redo',
    shortcut: 'ctrl+y',
  },
];
