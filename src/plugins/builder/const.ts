import { BuilderTool } from './types';

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

export const builderTools: BuilderTool[] = [
  {
    value: 'pan',
    label: 'Pan',
    icon: 'mdi-drag-variant',
    shortcut: 'q',
    cursor: 'all-scroll',
  },
  {
    label: 'Select',
    value: 'select',
    icon: 'mdi-select-drag',
    shortcut: 's',
    cursor: 'crosshair',
    partClass: part => part != null ? 'pointer' : '',
  },
  {
    value: 'gridresize',
    label: 'Resize grid',
    icon: 'mdi-grid',
    shortcut: 'g',
    cursor: 'crosshair',
  },
  {
    value: 'add',
    label: 'New',
    icon: 'add',
    shortcut: 'n',
    cursor: 'auto',
  },
  {
    value: 'move',
    label: 'Move',
    icon: 'mdi-cursor-move',
    shortcut: 'm',
    cursor: 'auto',
  },
  {
    value: 'copy',
    label: 'Copy',
    icon: 'file_copy',
    shortcut: 'c',
    cursor: 'auto',
  },
  {
    value: 'rotate',
    label: 'Rotate',
    icon: 'mdi-rotate-right-variant',
    shortcut: 'r',
    cursor: 'auto',
  },
  {
    label: 'Flip',
    value: 'flip',
    icon: 'mdi-swap-horizontal-bold',
    shortcut: 'f',
    cursor: 'auto',
  },
  {
    value: 'edit',
    label: 'Edit Settings',
    icon: 'settings',
    shortcut: 'e',
    cursor: 'auto',
  },
  {
    label: 'Interact',
    value: 'interact',
    icon: 'mdi-cursor-default',
    shortcut: 'i',
    cursor: 'auto',
  },
  {
    label: 'Delete',
    value: 'delete',
    icon: 'delete',
    shortcut: 'd',
    cursor: 'auto',
  },
  {
    label: 'Undo',
    value: 'undo',
    icon: 'mdi-undo',
    shortcut: 'ctrl+z',
    cursor: 'auto',
  },
  {
    label: 'Redo',
    value: 'redo',
    icon: 'mdi-redo',
    shortcut: 'ctrl+y',
    cursor: 'auto',
  },
];
