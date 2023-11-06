<script setup lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { prettyQty } from '@/utils/quantity';
import { SetpointSensorPairBlock } from 'brewblox-proto/ts';

const { serviceId, block, patchBlock, isClaimed } =
  useBlockWidget.setup<SetpointSensorPairBlock>();

function editSetting(): void {
  if (isClaimed.value) {
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
    patchBlock({ storedSetting: v });
  });
}
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <SettingValueField
        :editable="!isClaimed"
        class="col-auto"
        @click="editSetting"
      >
        <template #valueIcon>
          <SensorSvgIcon
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #value>
          {{ prettyQty(block.data.value) }}
        </template>
        <template #settingIcon>
          <SetpointSvgIcon
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #setting>
          <template v-if="isClaimed">
            {{ prettyQty(block.data.setting) }}
          </template>
          <template v-else>
            {{ prettyQty(block.data.desiredSetting) }}
          </template>
        </template>
      </SettingValueField>

      <div class="col-break" />

      <ClaimIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
    </div>
  </div>
</template>
