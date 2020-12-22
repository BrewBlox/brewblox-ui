<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { deepCopy, findById } from '@/helpers/functional';

import { EventControlDevice } from '../types';
import { StateValue } from './types';


@Component
export default class EventControlledDialog extends DialogBase {
  localValues: StateValue[] = [];

  @Prop({ type: Object, required: true })
  public readonly device!: EventControlDevice;

  @Prop({ type: Array, required: true })
  public readonly values!: StateValue[];

  created(): void {
    this.localValues = deepCopy(this.values);
  }

  updateValue(id: string, value: StateValue['value']): void {
    const state = findById(this.localValues, id);
    if (state) {
      this.$set(state, 'value', value);
    }
  }

  showKeyboard(v: StateValue): void {
    createDialog({
      component: 'KeyboardDialog',
      value: v.value,
      type: v.type === 'number' ? 'number' : 'text',
    })
      .onOk(v => this.updateValue(v.id, v));
  }

  save(): void {
    this.onDialogOk(this.localValues);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div class="row q-gutter-sm">
        <div
          v-for="v in localValues"
          :key="v.id"
          class="col-grow min-width-md"
        >
          <template v-if="v.type === 'enum'">
            <LabeledField
              :label="v.label"
            >
              <q-btn-group outline>
                <q-btn
                  v-for="choice in v.choices"
                  :key="choice"
                  :label="choice"
                  :color="v.value === choice ? 'primary' : ''"
                  :disable="!v.editable"
                  outline
                  @click="$set(v, 'value', choice)"
                />
              </q-btn-group>
            </LabeledField>
          </template>
          <template v-else-if="v.type === 'number'">
            <q-input
              :label="v.label"
              :value="v.value"
              inputmode="numeric"
              pattern="[0-9]*"
              :readonly="!v.editable"
              @input="newV => $set(v, 'value', parseFloat(newV))"
            >
              <template #append>
                <KeyboardButton
                  v-if="v.editable"
                  @click="showKeyboard(v)"
                />
              </template>
            </q-input>
          </template>
          <template v-else-if="v.type === 'string'">
            <q-input
              :label="v.label"
              :value="v.value"
              :readonly="!v.editable"
              @input="newV => $set(v, 'value', newV)"
            >
              <template #append>
                <KeyboardButton
                  v-if="v.editable"
                  @click="showKeyboard(v)"
                />
              </template>
            </q-input>
          </template>
        </div>
      </div>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
