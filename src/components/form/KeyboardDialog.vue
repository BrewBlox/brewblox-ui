<script setup lang="ts">
import Keyboard from 'simple-keyboard';
import KeyboardLayouts from 'simple-keyboard-layouts';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { userUISettings } from '@/user-settings';
import { isDurationString } from '@/utils/identity';
import { makeRuleValidator } from '@/utils/rules';
import 'simple-keyboard/build/css/index.css';
import { computed, ref, watch } from 'vue';

type BoardType = 'text' | 'number' | 'duration';

interface Props extends UseDialogProps {
  modelValue: string | number | null;
  suffix?: string;
  type?: BoardType;
  password?: boolean;
  rules?: InputRule[];
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  suffix: '',
  type: 'text',
  password: false,
  rules: () => [],
});

defineEmits<UseDialogEmits>();

const customLayouts = {
  // text layout is fetched from system store
  number: {
    default: ['- {bksp}', '1 2 3', '4 5 6', '7 8 9', '0 .'],
  },
  duration: {
    default: ['- {bksp}', '1 2 3', '4 5 6', '7 8 9', '0 .', 's m d h'],
  },
};

const basicRules: Record<BoardType, InputRule[]> = {
  text: [],
  number: [(v) => isFinite(Number(v)) || 'Value is not a number'],
  duration: [(v) => isDurationString(v) || 'Value is not a duration'],
};

const { dialogOpts, dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<string | number>();

const keyboardElementRef = ref<HTMLElement | null>(null);
const keyboard = ref<Keyboard | null>(null);
const local = ref<string>(`${props.modelValue ?? ''}`);

const lockActive = ref(false);
const shiftActive = ref(false);
const pwdActive = ref(true);

const localRules = computed<InputRule[]>(() => [
  ...basicRules[props.type],
  ...props.rules,
]);

const valid = computed<boolean>(() =>
  makeRuleValidator(localRules.value)(local.value),
);

function findLayout(): any {
  const custom = customLayouts[props.type];
  if (custom) {
    return custom;
  }
  const layouts = new KeyboardLayouts();
  const layoutName = userUISettings.value.keyboardLayout;
  return layouts.get(layoutName).layout;
}

function applyShift(): void {
  keyboard.value?.setOptions({
    layoutName: lockActive.value || shiftActive.value ? 'shift' : 'default',
  });
  lockActive.value
    ? keyboard.value?.addButtonTheme('{lock}', 'text-primary')
    : keyboard.value?.removeButtonTheme('{lock}', 'text-primary');
  shiftActive.value
    ? keyboard.value?.addButtonTheme('{shift}', 'text-primary')
    : keyboard.value?.removeButtonTheme('{shift}', 'text-primary');
}

function clearInput(): void {
  local.value = '';
  keyboard.value?.clearInput();
}

function save(): void {
  const actual = props.type === 'number' ? Number(local.value) : local.value;
  onDialogOK(actual);
}

function onChange(value: string): void {
  local.value = value;
}

async function onKeyPress(button: string): Promise<void> {
  if (button === '{lock}') {
    lockActive.value = !lockActive.value;
    shiftActive.value = false;
    applyShift();
  } else if (button === '{shift}') {
    shiftActive.value = !shiftActive.value;
    applyShift();
  } else if (shiftActive.value) {
    shiftActive.value = false;
    applyShift();
  }
}

const onWatcherDone = watch(keyboardElementRef, (el) => {
  if (el) {
    keyboard.value = new Keyboard(el, {
      onChange,
      onKeyPress,
      theme: 'hg-theme-default keyboard-theme-brewblox',
      newLineOnEnter: true,
      display: {
        '{bksp}': '⌫',
        '{enter}': 'Enter',
        '{tab}': 'tab ⇥',
        '{lock}': 'Caps Lock',
        '{shift}': '⇧',
        '{space}': ' ',
        '{esc}': '⊗',
      },
      buttonTheme: [{ buttons: '-', class: 'text-h5' }],
      layout: findLayout(),
    });
    keyboard.value.setInput(local.value);
    onWatcherDone();
  }
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    transition-show="fade"
    :class="`keyboard-dialog--${type}`"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ message, html }">
      <template #body>
        <q-card-section>
          <q-input
            :model-value="local"
            :suffix="suffix"
            :type="password && pwdActive ? 'password' : 'textarea'"
            autogrow
            label=""
            item-aligned
            readonly
            :rules="localRules"
            class="q-mb-md"
          >
            <template #append>
              <q-icon
                v-if="password"
                :name="pwdActive ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="pwdActive = !pwdActive"
              />
              <q-icon
                v-if="local"
                class="pointer self-end q-mb-sm fade-3"
                name="mdi-close-circle"
                size="sm"
                @click="clearInput"
              />
            </template>
          </q-input>
          <div
            ref="keyboardElementRef"
            class="simple-keyboard"
          />
        </q-card-section>
      </template>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!valid"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>

<style lang="sass">
.keyboard-dialog--text
  .q-dialog-plugin
    width: 605px
    max-width: 100vw

.keyboard-dialog--duration, .keyboard-dialog--number
  .q-dialog-plugin
    width: 405px
    max-width: 100vw

.simple-keyboard
  max-width: 850px
  margin: 0

  &.keyboard-theme-brewblox
    background-color: $dark
    border-radius: 0
    border-bottom-right-radius: 5px
    border-bottom-left-radius: 5px

  &.keyboard-theme-brewblox .hg-button
    height: 50px
    display: flex
    justify-content: center
    align-items: center
    background: rgba(0, 0, 0, 0.5)
    color: white

  &.keyboard-theme-brewblox .hg-button:active
    background: #1c4995
    color: white
</style>
