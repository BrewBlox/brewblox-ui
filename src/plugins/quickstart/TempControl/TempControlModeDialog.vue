<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy, typeMatchFilter } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, SetpointSensorPairBlock } from '@/shared-types';

import { TempControlMode } from './types';


@Component
export default class TempControlModeDialog extends DialogBase {
  setpointFilter = typeMatchFilter(BlockType.SetpointSensorPair);
  durationRules: InputRule[] = [
    v => v >= 0 || 'Value must be positive',
    v => v < (2 ** 16 * 1000) || 'Value is too large to be stored in firmware',
  ];
  tempMode: TempControlMode | null = null;

  @Prop({ type: Object, required: true })
  public readonly value!: TempControlMode;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String, default: 'Edit control mode' })
  public readonly title!: string;

  created(): void {
    this.tempMode = deepCopy(this.value);
  }

  get module(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get setpoint(): SetpointSensorPairBlock | null {
    return this.module && this.tempMode
      ? this.module.blockByLink(this.tempMode.setpoint)
      : null;
  }

  save(): void {
    this.onDialogOk(this.tempMode);
  }

}
</script>

<template>
  <q-dialog
    ref="dialog"
    :maximized="$dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="title" subtitle="Temperature control mode" />
      </template>

      <q-card-section
        class="row q-gutter-xs"
      >
        <InputField
          v-model="tempMode.title"
          label="Mode name"
          title="Mode name"
          class="col-grow"
        />

        <LinkField
          v-model="tempMode.setpoint"
          :service-id="serviceId"
          :block-filter="setpointFilter"
          :label-color="!setpoint ? 'negative' : ''"
          title="Setpoint"
          label="Setpoint"
          class="col-grow"
        />

        <div class="col-break" />

        <QuantityField
          v-model="tempMode.coolConfig.kp"
          title="Cool Kp"
          label="Cool Kp"
          class="col"
        />
        <DurationField
          v-model="tempMode.coolConfig.ti"
          :rules="durationRules"
          title="Cool Ti"
          label="Cool Ti"
          class="col"
        />
        <DurationField
          v-model="tempMode.coolConfig.td"
          :rules="durationRules"
          title="Cool Td"
          label="Cool Td"
          class="col"
        />

        <div class="col-break" />

        <QuantityField
          v-model="tempMode.heatConfig.kp"
          title="Heat Kp"
          label="Heat Kp"
          class="col"
        />
        <DurationField
          v-model="tempMode.heatConfig.ti"
          :rules="durationRules"
          title="Heat Ti"
          label="Heat Ti"
          class="col"
        />
        <DurationField
          v-model="tempMode.heatConfig.td"
          :rules="durationRules"
          title="Heat Td"
          label="Heat Td"
          class="col"
        />
      </q-card-section>

      <template #actions>
        <q-btn
          unelevated
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-space />
        <q-btn
          unelevated
          label="Confirm"
          @click="save"
        />
      </template>
    </ActionCardWrapper>
  </q-dialog>
</template>
