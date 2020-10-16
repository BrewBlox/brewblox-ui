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
      ? roundNumber(v, 0)
      : v;
  }

  get pwmSetting(): number | null {
    const v = this.block.data.setting;
    return v
      ? roundNumber(v, 0)
      : v;
  }

  get pwmDesired(): number | null {
    const v = this.block.data.desiredSetting;
    return v
      ? roundNumber(v, 0)
      : v;
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body">
      <div
        v-if="!isDriven"
        class="row justify-around full-width"
      >
        <div
          v-for="q in quickValues"
          :key="'quick'+q.value"
          class="col-auto blue-3"
        >
          <q-btn
            :label="q.label"
            unelevated
            :disabled="isDriven"
            color="grey-11"
            @click="updateSetting(q.value)"
          />
        </div>
      </div>
      <div v-else class="text-indigo-4 text-center">
        Externally driven
      </div>
      <div class="q-pt-xl" style="width: 90%; margin-left: 5%; position: relative">
        <q-slider
          :value="pwmValue"
          dense
          label
          readonly
          label-always
          color="secondary"
          style="position: absolute; width: 100%;"
          @change="updateSetting"
        />
        <q-slider
          :value="pwmSetting"
          dense
          label
          readonly
          label-always
          color="pink-4"
          style="position: absolute; width: 100%;"
          @change="updateSetting"
        />
        <q-slider
          :value="pwmDesired"
          dense
          label
          label-always
          :readonly="isDriven"
          color="primary"
          style="position: absolute; width: 100%;"
          @change="updateSetting"
        />
      </div>

      <div class="q-mt-lg full-width row justify-around">
        <div class="text-primary">
          Setting
        </div>
        <div class="text-pink-4">
          Limited
        </div>
        <div class="text-secondary">
          Achieved
        </div>
      </div>


      <div class="q-mt-lg full-width row">
        <DrivenIndicator
          :block-id="
            block.id"
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
  </div>
</template>
