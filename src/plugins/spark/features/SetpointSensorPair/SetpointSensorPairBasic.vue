<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { SetpointSensorPairBlock } from '@/plugins/spark/types';


@Component
export default class SetpointSensorPairBasic
  extends BlockCrudComponent<SetpointSensorPairBlock> {

  editSetting(): void {
    if (this.isDriven) { return; }
    createDialog({
      component: 'QuantityDialog',
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
      <SettingValueField :editable="!isDriven" class="col-auto" @click="editSetting">
        <template #valueIcon>
          <q-icon name="mdi-thermometer" color="green-3" />
        </template>
        <template #value>
          {{ block.data.value | quantity }}
        </template>
        <template #setting>
          {{ block.data.storedSetting | quantity }}
        </template>
      </SettingValueField>

      <div class="col-break" />

      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
    </div>
  </div>
</template>
