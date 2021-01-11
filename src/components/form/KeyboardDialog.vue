<script lang="ts">
import 'simple-keyboard/build/css/index.css';

import Keyboard from 'simple-keyboard';
import KeyboardLayouts from 'simple-keyboard-layouts';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { isDurationString } from '@/helpers/duration';
import { ruleValidator } from '@/helpers/functional';
import { systemStore } from '@/store/system';

type BoardType = 'text' | 'number' | 'duration';

const typeValidator = (v: BoardType): boolean =>
  [
    'text',
    'number',
    'duration',
  ]
    .includes(v);

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
  number: [
    v => isFinite(Number(v)) || 'Value is not a number',
  ],
  duration: [
    v => isDurationString(v) || 'Value is not a duration',
  ],
};

@Component
export default class KeyboardDialog extends DialogBase {
  keyboard: Keyboard | null = null;
  local: string = '';

  lockActive: boolean = false;
  shiftActive: boolean = false;
  pwdActive: boolean = true;

  @Prop({ type: [String, Number], required: false })
  public readonly value!: string | number | null;

  @Prop({ type: String, required: false })
  public readonly suffix!: string;

  @Prop({ type: String, default: 'text', validator: typeValidator })
  public readonly type!: BoardType;

  @Prop({ type: Boolean, default: false })
  public readonly password!: boolean;

  @Prop({ type: Array, default: () => ([]) })
  public readonly rules!: InputRule[];

  get localRules(): InputRule[] {
    return [
      ...basicRules[this.type],
      ...this.rules,
    ];
  }

  get valid(): boolean {
    return ruleValidator(this.localRules)(this.local);
  }

  findLayout(): any {
    const custom = customLayouts[this.type];
    if (custom) {
      return custom;
    }

    const layouts = new KeyboardLayouts();
    const layoutName = systemStore.config.keyboardLayout;
    return layouts.get(layoutName);
  }

  async mounted(): Promise<void> {
    await this.$nextTick();

    this.keyboard = new Keyboard({
      onChange: this.onChange,
      onKeyPress: this.onKeyPress,
      theme: 'hg-theme-default keyboard-theme-brewblox',
      layout: this.findLayout(),
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
      buttonTheme: [
        { buttons: '-', class: 'text-h5' },
      ],
    });
    this.local = `${this.value ?? ''}`;
    this.keyboard.setInput(this.local);
  }

  beforeDestroy(): void {
    this.keyboard?.destroy();
  }

  onChange(value: string): void {
    this.local = value;
  }

  clearInput(): void {
    this.local = '';
    this.keyboard?.clearInput();
  }

  async onKeyPress(button: string): Promise<void> {
    if (button === '{lock}') {
      this.lockActive = !this.lockActive;
      this.shiftActive = false;
      this.applyShift();
    }
    else if (button === '{shift}') {
      this.shiftActive = !this.shiftActive;
      this.applyShift();
    }
    else if (this.shiftActive) {
      this.shiftActive = false;
      this.applyShift();
    }
  }

  applyShift(): void {
    this.keyboard?.setOptions({
      layoutName: (this.lockActive || this.shiftActive) ? 'shift' : 'default',
    });
    this.lockActive
      ? this.keyboard?.addButtonTheme('{lock}', 'text-primary')
      : this.keyboard?.removeButtonTheme('{lock}', 'text-primary');
    this.shiftActive
      ? this.keyboard?.addButtonTheme('{shift}', 'text-primary')
      : this.keyboard?.removeButtonTheme('{shift}', 'text-primary');
  }

  save(): void {
    const actual = this.type === 'number'
      ? Number(this.local)
      : this.local;
    this.onDialogOk(actual);
  }
}
</script>


<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    transition-show="fade"
    :class="`keyboard-dialog--${type}`"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{message, html}">
      <q-input
        :value="local"
        :suffix="suffix"
        :type="(password && pwdActive) ? 'password' : 'textarea'"
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
      <div class="simple-keyboard" />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="!valid" flat label="OK" color="primary" @click="save" />
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
