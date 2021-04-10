import { DialogChainObject } from 'quasar';
import KeyboardLayouts from 'simple-keyboard-layouts';

import { systemStore } from '@/store/system';
import { SystemConfig } from '@/store/system/types';
import { createDialog } from '@/utils/dialog';

export function startChangeKeyboardLayout(): DialogChainObject {
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: Object.keys(new KeyboardLayouts().layouts),
      value: systemStore.config.keyboardLayout,
      title: 'Select layout for virtual keyboard',
      selectProps: {
        label: 'Layout',
      },
    },
  })
    .onOk(keyboardLayout => systemStore.saveConfig({ keyboardLayout }));
}

export function startEditBuilderTouchDelay(): DialogChainObject {
  const selectOptions: SelectOption<SystemConfig['builderTouchDelayed']>[] = [
    { label: 'Always', value: 'always' },
    { label: 'Never', value: 'never' },
    { label: 'Only on mobile', value: 'dense' },
  ];

  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      listSelect: true,
      selectOptions,
      title: 'Click twice to interact?',
      message: `
      Actuators and valves can be activated by clicking on them in the builder.
      To prevent accidental activation, you can require two clicks:
      the first to select, and the second to confirm.
      `,
      value: systemStore.config.builderTouchDelayed,
    },
  })
    .onOk(builderTouchDelayed => systemStore.saveConfig({ builderTouchDelayed }));
}

export function startChangeTempUnit(): DialogChainObject {
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: [
        { value: 'degC', label: 'Celsius' },
        { value: 'degF', label: 'Fahrenheit' },
      ],
      value: systemStore.units.temperature,
      title: 'Choose temperature unit',
      message: `
      <p>
        Choose temperature units for all your services. <br>
        This will affect how temperatures are displayed and logged.
      </p>
      <p>
        Spark data with different units is logged under different field names to distinguish the values. <br>
        After changing a unit, you will need to select different fields in your Graph and Metrics widgets.
      </p>
      `,
      html: true,
      selectProps: {
        label: 'Unit',
      },
    },
  })
    .onOk(temperature => systemStore.saveUnits({ temperature }));
}
