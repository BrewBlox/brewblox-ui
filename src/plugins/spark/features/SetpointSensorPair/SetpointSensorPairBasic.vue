<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairBasic
  extends BlockCrudComponent<SetpointSensorPairBlock> {

  editSetting(): void {
    if (this.isDriven) { return; }
    createDialog({
      component: 'UnitDialog',
      title: 'Setting',
      label: 'Setting',
      value: this.block.data.storedSetting,
    })
      .onOk(v => {
        this.block.data.storedSetting = v;
        this.saveBlock();
      });
  }
}
</script>

<template>
  <div class="widget-md q-mx-auto">
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <div
        :class="[
          'col-auto q-py-md grid-container rounded-borders',
          {clickable: !isDriven, darkened: !block.data.settingEnabled},
        ]"
        @click="editSetting"
      >
        <q-icon
          class="grid-icon q-mx-auto"
          name="mdi-thermometer"
          size="sm"
          color="green-3"
        />
        <div class="grid-value text-h5">
          {{ block.data.value | unit }}
        </div>

        <q-icon
          class="grid-icon q-mx-auto"
          name="mdi-unfold-more-horizontal"
          size="sm"
          color="amber-4"
        />
        <div class="grid-value text-h6 text-amber-4">
          {{ block.data.storedSetting | unit }}
        </div>
      </div>
      <!--
      <UnitField
        :class="{darkened: !block.data.settingEnabled}"
        :value="block.data.storedSetting"
        :readonly="isDriven"
        title="Setting"
        label="Setting"
        tag="big"
        class="col-grow"
        @input="v => {block.data.storedSetting = v; saveBlock()}"
      />
      <UnitField
        :value="block.data.value"
        label="Sensor"
        tag="big"
        readonly
        class="col-grow"
      />
      <UnitField
        :value="block.data.valueUnfiltered"
        label="Unfiltered sensor"
        tag="big"
        class="col-grow"
        readonly
      />
      -->

      <div class="col-break" />

      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
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
