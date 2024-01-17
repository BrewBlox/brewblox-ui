import { StoreObject, StoreObjectImpl } from 'brewblox-proto/ts';
import { format as formatDate } from 'date-fns/format';
import defaults from 'lodash/defaults';
import omit from 'lodash/omit';
import { defineStore } from 'pinia';
import { DialogChainObject } from 'quasar';
import KeyboardLayouts from 'simple-keyboard-layouts';
import timezones from '@/assets/timezones.json';
import {
  defaultUserTimeZone,
  defaultUserUISettings,
  defaultUserUnits,
  UserTimeZone,
  userTimeZone,
  UserUISettings,
  userUISettings,
  UserUnits,
  userUnits,
  userUnitsDefined,
} from '@/user-settings';
import { createDialog } from '@/utils/dialog';
import { configApi, globalApi } from './api';

type StoredUserUISettings = StoreObjectImpl<UserUISettings>;
type StoredUserUnits = StoreObjectImpl<UserUnits>;
type StoredUserTimeZone = StoreObjectImpl<UserTimeZone>;

const UI_SETTINGS_STORE_ID = 'default';
const USER_UNITS_STORE_ID = 'units';
const USER_TIMEZONE_STORE_ID = 'timeZone';

const settingsPredicate = (v: StoreObject): v is StoredUserUISettings =>
  v.id === UI_SETTINGS_STORE_ID;

const unitsPredicate = (v: StoreObject): v is StoredUserUnits =>
  v.id === USER_UNITS_STORE_ID;

const timeZonePredicate = (v: StoreObject): v is StoredUserTimeZone =>
  v.id === USER_TIMEZONE_STORE_ID;

export const useSystemStore = defineStore('systemStore', () => {
  function updateUserUISettings(obj: Maybe<StoredUserUISettings>): void {
    const settings = defaults(obj, defaultUserUISettings());
    userUISettings.value = omit(settings, 'id', 'namespace');
  }

  function updateUserUnits(obj: Maybe<StoredUserUnits>): void {
    const units = defaults(obj, defaultUserUnits());
    userUnits.value = omit(units, 'id', 'namespace');
    userUnitsDefined.value = obj != null;
  }

  function updateUserTimeZone(obj: Maybe<StoredUserTimeZone>): void {
    const timeZone = defaults(obj, defaultUserTimeZone());
    userTimeZone.value = omit(timeZone, 'id', 'namespace');
  }

  async function patchUserUISettings(
    patch: Partial<UserUISettings>,
  ): Promise<void> {
    // Triggers callback
    await configApi.persist({
      ...userUISettings.value,
      ...patch,
      id: UI_SETTINGS_STORE_ID,
    });
  }

  async function patchUserUnits(patch: Partial<UserUnits>): Promise<void> {
    // Triggers callback
    await globalApi.persist({
      ...userUnits.value,
      ...patch,
      id: USER_UNITS_STORE_ID,
    });
  }

  async function patchUserTimeZone(
    patch: Partial<UserTimeZone>,
  ): Promise<void> {
    // Triggers callback
    await globalApi.persist({
      ...userTimeZone.value,
      ...patch,
      id: USER_TIMEZONE_STORE_ID,
    });
  }

  async function start(): Promise<void> {
    updateUserUISettings(await configApi.fetchById(UI_SETTINGS_STORE_ID));
    const globalValues = await globalApi.fetch();

    updateUserUnits(globalValues.find(unitsPredicate));
    updateUserTimeZone(globalValues.find(timeZonePredicate));

    configApi.subscribe(
      (obj) => {
        if (settingsPredicate(obj)) {
          updateUserUISettings(obj);
        }
      },
      (id) => {
        switch (id) {
          case UI_SETTINGS_STORE_ID:
            updateUserUISettings(null);
            break;
          default:
            break;
        }
      },
    );

    globalApi.subscribe(
      (obj) => {
        if (unitsPredicate(obj)) {
          updateUserUnits(obj);
        }
        if (timeZonePredicate(obj)) {
          updateUserTimeZone(obj);
        }
      },
      (id) => {
        switch (id) {
          case USER_UNITS_STORE_ID:
            updateUserUnits(null);
            break;
          case USER_TIMEZONE_STORE_ID:
            updateUserTimeZone(null);
            break;
          default:
            break;
        }
      },
    );
  }

  return {
    updateUserUISettings,
    updateUserUnits,
    updateUserTimeZone,
    patchUserUISettings,
    patchUserUnits,
    patchUserTimeZone,
    start,
  };
});

export function startChangeKeyboardLayout(): DialogChainObject {
  const systemStore = useSystemStore();
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: Object.keys(new KeyboardLayouts().layouts),
      modelValue: userUISettings.value.keyboardLayout,
      title: 'Select layout for virtual keyboard',
      selectProps: {
        label: 'Layout',
      },
    },
  }).onOk((keyboardLayout) =>
    systemStore.patchUserUISettings({ keyboardLayout }),
  );
}

export function startEditBuilderTouchDelay(): DialogChainObject {
  const systemStore = useSystemStore();
  const selectOptions: SelectOption<UserUISettings['builderTouchDelayed']>[] = [
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
      modelValue: userUISettings.value.builderTouchDelayed,
    },
  }).onOk((builderTouchDelayed) =>
    systemStore.patchUserUISettings({ builderTouchDelayed }),
  );
}

export function startChangeTempUnit(): DialogChainObject {
  const systemStore = useSystemStore();
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: [
        { value: 'degC', label: 'Celsius' },
        { value: 'degF', label: 'Fahrenheit' },
      ],
      modelValue: userUnits.value.temperature,
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
  }).onOk((temperature) => systemStore.patchUserUnits({ temperature }));
}

export function startChangeGravityUnit(): DialogChainObject {
  const systemStore = useSystemStore();
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: [
        { value: 'G', label: 'Specific gravity' },
        { value: 'degP', label: 'Plato' },
      ],
      modelValue: userUnits.value.gravity,
      title: 'Choose gravity unit',
      message: `
      <p>
        Choose gravity units for all your services. <br>
        This will affect how specific gravity measurements are displayed and logged.
      </p>
      `,
      html: true,
      selectProps: {
        label: 'Unit',
      },
    },
  }).onOk((gravity) => systemStore.patchUserUnits({ gravity }));
}

export function startChangeTimezone(): DialogChainObject {
  const systemStore = useSystemStore();
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: Object.keys(timezones).map((value) => ({
        value,
        label: value.replaceAll('_', ' '),
      })),
      modelValue: userTimeZone.value.name,
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
  }).onOk((name: string) => {
    const posixValue = timezones[name];
    systemStore.patchUserTimeZone({ name, posixValue });
  });
}

export function startChangeDateFormat(): DialogChainObject {
  const systemStore = useSystemStore();
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: [
        'P',
        'yyyy-MM-dd',
        'yyyy/MM/dd',
        'dd/MM/yyyy',
        'dd/MM/yy',
        'MM/dd/yyyy',
        'MM/dd/yy',
        'MMM dd, yyyy',
      ].map((fmt) => ({
        label:
          formatDate(new Date(1953, 3, 29), fmt) +
          (fmt.startsWith('P') ? ' (default)' : ''),
        value: fmt,
      })),
      modelValue: userUISettings.value.dateFormatString,
      title: 'Choose date formatting',
      message:
        'Choose how date values are formatted in the UI. ' +
        'The default value uses browser settings.',
      selectProps: {
        label: 'Date format',
      },
    },
  }).onOk((dateFormatString: string) => {
    systemStore.patchUserUISettings({ dateFormatString });
  });
}

export function startChangeTimeFormat(): DialogChainObject {
  const systemStore = useSystemStore();
  return createDialog({
    component: 'SelectDialog',
    componentProps: {
      selectOptions: ['pp', 'HH:mm:ss', 'hh:mm:ss aa'].map((fmt) => ({
        label:
          formatDate(new Date(1453, 3, 29, 14, 53, 20), fmt) +
          (fmt.startsWith('p') ? ' (default)' : ''),
        value: fmt,
      })),
      modelValue: userUISettings.value.timeFormatString,
      title: 'Choose time formatting',
      message:
        'Choose how time values are formatted in the UI. ' +
        'The default value uses browser settings.',
      selectProps: {
        label: 'Time format',
      },
    },
  }).onOk((timeFormatString: string) => {
    systemStore.patchUserUISettings({ timeFormatString });
  });
}
