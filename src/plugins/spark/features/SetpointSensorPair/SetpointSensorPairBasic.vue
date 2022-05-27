<script lang="ts">
import { defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { SetpointSensorPairBlock } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';
import { prettyQty } from '@/utils/formatting';

export default defineComponent({
  name: 'SetpointSensorPairBasic',
  setup() {
    const { serviceId, block, saveBlock, isDriven } =
      useBlockWidget.setup<SetpointSensorPairBlock>();

    function editSetting(): void {
      if (isDriven.value) {
        return;
      }
      createDialog({
        component: 'QuantityDialog',
        componentProps: {
          title: 'Setting',
          label: 'Setting',
          modelValue: block.value.data.storedSetting,
        },
      }).onOk((v) => {
        block.value.data.storedSetting = v;
        saveBlock();
      });
    }

    return {
      prettyQty,
      serviceId,
      block,
      isDriven,
      editSetting,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <SettingValueField
        :editable="!isDriven"
        class="col-auto"
        @click="editSetting"
      >
        <template #valueIcon>
          <q-icon
            name="mdi-thermometer"
            color="green-3"
          />
        </template>
        <template #value>
          {{ prettyQty(block.data.value) }}
        </template>
        <template #setting>
          {{ prettyQty(block.data.storedSetting) }}
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
