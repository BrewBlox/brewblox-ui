<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { bloxQty } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
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

  @Prop({ type: Function, required: true })
  public readonly saveMode!: (mode: TempControlMode) => unknown;

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

  get serviceTemp(): 'degC' | 'degF' {
    return this.module?.units.Temp ?? 'degC';
  }

  get setpoint(): SetpointSensorPairBlock | null {
    return this.module && this.tempMode
      ? this.module.blockByLink(this.tempMode.setpoint)
      : null;
  }

  save(): void {
    this.saveMode(this.tempMode!);
  }

  removeConfig(kind: 'cool' | 'heat'): void {
    createDialog({
      component: 'ConfirmDialog',
      title: `Remove ${kind} config`,
      message: `Are you sure you want to remove the ${kind} config from the ${this.tempMode!.title} mode?`,
      noBackdropDismiss: true,
    })
      .onOk(() => {
        this.$set(this.tempMode!, kind + 'Config', null);
        this.save();
      });
  }

  addCoolConfig(): void {
    this.tempMode!.coolConfig = {
      kp: bloxQty(-50, '1/degC').to(`1/${this.serviceTemp}`),
      ti: bloxQty('0s'),
      td: bloxQty('0s'),
    };
    this.save();
  }

  addHeatConfig(): void {
    this.tempMode!.heatConfig = {
      kp: bloxQty(100, '1/degC').to(`1/${this.serviceTemp}`),
      ti: bloxQty('0s'),
      td: bloxQty('0s'),
    };
    this.save();
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
          :value="tempMode.title"
          label="Mode name"
          title="Mode name"
          class="col-grow"
          @input="v => { tempMode.title = v; save(); }"
        />

        <LinkField
          :value="tempMode.setpoint"
          :service-id="serviceId"
          :block-filter="setpointFilter"
          :label-color="!setpoint ? 'negative' : ''"
          title="Setpoint"
          label="Setpoint"
          class="col-grow"
          @input="v => { tempMode.setpoint = v; save(); }"
        />

        <div class="col-break" />

        <template v-if="tempMode.coolConfig">
          <QuantityField
            :value="tempMode.coolConfig.kp"
            title="Cool Kp"
            label="Cool Kp"
            class="col cool-field"
            @input="v => { tempMode.coolConfig.kp = v; save(); }"
          />
          <DurationField
            :value="tempMode.coolConfig.ti"
            :rules="durationRules"
            title="Cool Ti"
            label="Cool Ti"
            class="col cool-field"
            @input="v => { tempMode.coolConfig.ti = v; save(); }"
          />
          <DurationField
            :value="tempMode.coolConfig.td"
            :rules="durationRules"
            title="Cool Td"
            label="Cool Td"
            class="col cool-field"
            @input="v => { tempMode.coolConfig.td = v; save(); }"
          />
          <q-btn
            flat
            icon="delete"
            @click="removeConfig('cool')"
          >
            <q-tooltip>
              Remove cool config from this mode.
            </q-tooltip>
          </q-btn>
        </template>
        <q-btn
          v-else
          flat
          color="blue"
          label="Add cool PID settings"
          @click="addCoolConfig"
        />

        <div class="col-break" />

        <template v-if="tempMode.heatConfig">
          <QuantityField
            :value="tempMode.heatConfig.kp"
            title="Heat Kp"
            label="Heat Kp"
            class="col heat-field"
            @input="v => { tempMode.heatConfig.kp = v; save(); }"
          />
          <DurationField
            :value="tempMode.heatConfig.ti"
            :rules="durationRules"
            title="Heat Ti"
            label="Heat Ti"
            class="col heat-field"
            @input="v => { tempMode.heatConfig.ti = v; save(); }"
          />
          <DurationField
            :value="tempMode.heatConfig.td"
            :rules="durationRules"
            title="Heat Td"
            label="Heat Td"
            class="col heat-field"
            @input="v => { tempMode.heatConfig.td = v; save(); }"
          />
          <q-btn
            flat
            icon="delete"
            @click="removeConfig('heat')"
          >
            <q-tooltip>
              Remove heat config from this mode.
            </q-tooltip>
          </q-btn>
        </template>
        <q-btn
          v-else
          flat
          color="red"
          label="Add heat PID settings"
          @click="addHeatConfig"
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
          color="primary"
          @click="onDialogOk()"
        />
      </template>
    </ActionCardWrapper>
  </q-dialog>
</template>

<style lang="sass" scoped>
.heat-field
  background: rgba($red, 0.1)

.cool-field
  background: rgba($blue, 0.1)
</style>
