import { DialogChainObject } from 'quasar';
import KeyboardLayouts from 'simple-keyboard-layouts';
import timezones from 'timezones/zones.json';

import { sparkStore } from '@/plugins/spark/store';
import { BlockType, DisplaySettingsBlock } from '@/shared-types';
import { systemStore } from '@/store/system';
import { SystemConfig } from '@/store/system/types';
import { createDialog } from '@/utils/dialog';

export function startChangeKeyboardLayout(): DialogChainObject {
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: Object.keys(new KeyboardLayouts().layouts),
      modelValue: systemStore.config.keyboardLayout,
      title: 'Select layout for virtual keyboard',
      selectProps: {
        label: 'Layout',
      },
    },
  }).onOk((keyboardLayout) => systemStore.saveConfig({ keyboardLayout }));
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
      modelValue: systemStore.config.builderTouchDelayed,
    },
  }).onOk((builderTouchDelayed) =>
    systemStore.saveConfig({ builderTouchDelayed }),
  );
}

export function startChangeTempUnit(): DialogChainObject {
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: [
        { value: 'degC', label: 'Celsius' },
        { value: 'degF', label: 'Fahrenheit' },
      ],
      modelValue: systemStore.units.temperature,
      title: 'Choose temperature unit',
      message: `
      <p>
        Choose temperature units for all your services. <br>
        This will affect how temperatures are displayed and logged.
      </p>
      <p>
        Spark data with different units is logged
        under different field names to distinguish the values. <br>
        After changing a unit, you will need to select
        different fields in your Graph and Metrics widgets.
      </p>
      `,
      html: true,
      selectProps: {
        label: 'Unit',
      },
    },
  }).onOk((temperature) => systemStore.saveUnits({ temperature }));
}

export function startChangeTimezone(): DialogChainObject {
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: Object.keys(timezones).map((value) => ({
        value,
        label: value.replaceAll('_', ' '),
      })),
      modelValue: systemStore.config.timeZone.name,
      title: 'Choose timezone',
      message: `
      <p>
        Choose the timezone for your Spark 4 services.
        This will affect the time displayed on the display.
      </p>
      <p>
        History data is always stored as UTC, and is unaffected by this setting.
      </p>
      `,
      html: true,
      selectProps: {
        label: 'Timezone',
      },
    },
  }).onOk(async (name: string) => {
    const posixValue = timezones[name];
    await Promise.all([
      systemStore.saveConfig({ timeZone: { name, posixValue } }),
      sparkStore.modules
        .flatMap((m) =>
          m.blocksByType<DisplaySettingsBlock>(BlockType.DisplaySettings),
        )
        .map((block) => {
          block.data.timeZone = posixValue;
          return sparkStore.saveBlock(block);
        }),
    ]);
  });
}
