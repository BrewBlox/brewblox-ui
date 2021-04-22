import { PartSpec, PersistentPart } from '@/plugins/builder/types';
import { showDrivingBlockDialog } from '@/plugins/builder/utils';
import { BlockType } from '@/plugins/spark/types';

const DEFAULT_SIZE_X = 5;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'HeatingElement',
  title: 'Heating element',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: 'pwm',
        compatible: [BlockType.ActuatorPwm],
        label: 'PWM',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 3,
        max: 10,
      },
    },
    {
      component: 'BorderCard',
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    SIZE_Y,
  ],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart) => showDrivingBlockDialog(part, 'pwm'),
};

export default spec;
