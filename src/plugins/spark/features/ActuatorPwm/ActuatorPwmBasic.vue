<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorPwmBlock } from './types';

@Component
export default class ActuatorPwmBasic
  extends BlockCrudComponent<ActuatorPwmBlock> {

  get isConstrained(): boolean {
    return this.block.data.enabled
      && this.block.data.setting !== this.block.data.desiredSetting;
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <div
        :class="[
          'col-auto q-py-md grid-container rounded-borders',
          {clickable: !isDriven},
        ]"
      >
        <PwmIcon
          class="grid-icon q-mx-auto"
          size="sm"
        />
        <div class="grid-value text-h5">
          {{ block.data.value | round }} %
        </div>

        <q-icon
          class="grid-icon q-mx-auto"
          name="mdi-unfold-more-horizontal"
          size="sm"
          color="amber-4"
        />
        <div :class="['grid-value text-h6 text-amber-4', {'text-orange': isConstrained}]">
          {{ block.data.setting | round }} %
        </div>
      </div>

      <!--
      <SliderField
        :value="block.data.setting"
        :readonly="isDriven"
        :tag-class="{['text-orange']: isConstrained}"
        title="Duty Setting"
        label="Setting"
        suffix="%"
        tag="big"
        class="col-grow"
        @input="v => { block.data.desiredSetting = v; saveBlock(); }"
      />
      <LabeledField
        :value="block.data.value"
        label="Duty achieved"
        number
        suffix="%"
        tag="big"
        class="col-grow"
      />
      <LabeledField
        v-if="isConstrained"
        label="Unconstrained setting"
        :value="block.data.desiredSetting"
        number
        suffix="%"
        tag="big"
        class="col-grow"
      />
      -->

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
