<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { roundNumber } from '@/helpers/functional';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorPwmBlock } from '@/plugins/spark/types';

@Component
export default class ActuatorPwmBasic
  extends BlockCrudComponent<ActuatorPwmBlock> {

  quickValues = [
    { label: '0%', value: 0 },
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: '100%', value: 100 },
  ]

  get isConstrained(): boolean {
    return this.block.data.enabled
      && this.block.data.setting !== this.block.data.desiredSetting;
  }

  updateSetting(value: number): void {
    this.block.data.desiredSetting = value;
    this.saveBlock();
  }

  editSetting(): void {
    if (this.isDriven) { return; }
    createDialog({
      component: 'SliderDialog',
      title: 'Desired setting',
      value: this.block.data.desiredSetting,
      quickActions: this.quickValues,
    })
      .onOk(this.updateSetting);
  }

  get pwmValue(): number | null {
    const v = this.block.data.value;
    return v
      ? roundNumber(v, 1)
      : v;
  }

  get pwmSetting(): number | null {
    const v = this.block.data.desiredSetting;
    return v
      ? roundNumber(v, 1)
      : v;
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <div class="col-break q-mt-md" />
      <div class="fade-4" style="width: 6ch">
        Value
      </div>
      <q-slider
        :value="pwmValue"
        dense
        label
        readonly
        class="col-grow fade-3"
        color="positive"
      />
      <div class="col-break" />
      <div class="fade-4" style="width: 6ch">
        Setting
      </div>
      <q-slider
        :value="pwmSetting"
        dense
        label
        :readonly="isDriven"
        :color="isConstrained ? 'pink-4' : 'primary'"
        :class="['col-grow', isDriven && 'fade-4']"
        @change="updateSetting"
      />
      <div class="col-break" />
      <div
        v-if="!isDriven"
        class="col-grow row justify-between q-gutter-sm"
      >
        <div
          v-for="q in quickValues"
          :key="'quick'+q.value"
          class="col-auto"
        >
          <q-btn
            :label="q.label"
            unelevated
            @click="updateSetting(q.value)"
          />
        </div>
      </div>

      <div class="col-break" />

      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />

      <ConstraintsField
        :value="block.data.constrainedBy"
        :service-id="serviceId"
        type="analog"
        class="col-grow"
        @input="v => { block.data.constrainedBy = v; saveBlock(); }"
      />
    </div>
  </div>
</template>
