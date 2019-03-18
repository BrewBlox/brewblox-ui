import { ComponentSettings } from '../state';
import { LEFT, IN_OUT } from '../getters';
import { defaultSettings } from '../components/getters';

const SIZE_X = 1;
const SIZE_Y = 4;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default settings;
