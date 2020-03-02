<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorPwmBlock } from './types';

@Component
export default class ActuatorPwmBasic
  extends BlockCrudComponent<ActuatorPwmBlock> {

  quickValues = [
    { label: '0%', value: 0 },
    { label: '50%', value: 50 },
    { label: '100%', value: 100 },
  ]

  get isConstrained(): boolean {
    return this.block.data.enabled
      && this.block.data.setting !== this.block.data.desiredSetting;
  }


  editSetting(): void {
    if (this.isDriven) { return; }
    createDialog({
      component: 'SliderDialog',
      title: 'Desired setting',
      value: this.block.data.desiredSetting,
      quickActions: this.quickValues,
    })
      .onOk(v => {
        this.block.data.desiredSetting = v;
        this.saveBlock();
      });
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <SettingValueField :editable="!isDriven" class="col-auto" @click="editSetting">
        <template #valueIcon>
          <PwmIcon />
        </template>
        <template #value>
          {{ block.data.value | round }} %
        </template>
        <template #setting>
          <div :class="{'text-orange': isConstrained}">
            {{ block.data.setting | round }} %
          </div>
        </template>
      </SettingValueField>

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

<style lang="sass" scoped>
.grid-container
  display: grid
  grid-template-columns: repeat(3, 50px)
  grid-row-gap: 5px
  grid-auto-flow: row

.grid-icon
  grid-column-end: span 1
  grid-column-start: 1

.grid-value
  grid-column-end: span 2
  grid-column-start: 2
  align-self: flex-end
</style>
