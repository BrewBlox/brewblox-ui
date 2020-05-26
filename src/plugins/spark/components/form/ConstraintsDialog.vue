<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { AnalogConstraintsObj, DigitalConstraintsObj } from '@/plugins/spark/types';
import { deepCopy } from '@/plugins/spark/units/parseObject';

import AnalogConstraints from './AnalogConstraints.vue';
import DigitalConstraints from './DigitalConstraints.vue';

type ConstraintsObj = AnalogConstraintsObj | DigitalConstraintsObj;

@Component({
  components: {
    analog: AnalogConstraints,
    digital: DigitalConstraints,
  },
})
export default class ConstraintsDialog extends DialogBase {
  local: ConstraintsObj | null = null;

  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: ConstraintsObj;

  @Prop({ type: String, required: true })
  protected readonly serviceId!: string;

  @Prop({ type: String, required: true, validator: v => ['analog', 'digital'].includes(v) })
  public readonly type!: string;

  created(): void {
    this.local = deepCopy(this.value);
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <component :is="type" v-model="local" :service-id="serviceId" />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
