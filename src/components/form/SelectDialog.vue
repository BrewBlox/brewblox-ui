<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

@Component
export default class SelectDialog extends DialogBase {
  local: any = null;

  @Prop({ default: () => null })
  public readonly value!: any;

  @Prop({ type: Array, required: true })
  public readonly selectOptions!: any[];

  @Prop({ type: Object, default: () => ({}) })
  public readonly selectProps!: any;

  @Prop({ type: Boolean, default: false })
  public readonly listSelect!: boolean;

  created(): void {
    this.local = this.value;
  }

  save(value: SelectOption): void {
    if (value !== null || this.selectProps.clearable) {
      this.onDialogOk(value);
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save(local)"
  >
    <DialogCard v-bind="{title, message, html}">
      <ListSelect
        v-if="listSelect"
        v-model="local"
        :options="selectOptions"
        emit-value
        option-value="value"
        option-label="label"
        v-bind="selectProps"
        @confirm="v => save(v)"
      />
      <q-select
        v-else
        v-model="local"
        :options="selectOptions"
        item-aligned
        emit-value
        map-options
        v-bind="selectProps"
        @keyup.enter.exact.stop
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <template #actions>
        <q-btn
          color="primary"
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!selectProps.clearable && local === null"
          color="primary"
          flat
          label="OK"
          @click="save(local)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
