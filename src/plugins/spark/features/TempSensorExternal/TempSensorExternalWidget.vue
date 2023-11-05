<script setup lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { prettyQty, shortDateString } from '@/utils/quantity';
import { TempSensorExternalBlock } from 'brewblox-proto/ts';

const { context, inDialog } = useContext.setup();
const { block, patchBlock } = useBlockWidget.setup<TempSensorExternalBlock>();

function editSetting(): void {
  createDialog({
    component: 'QuantityDialog',
    componentProps: {
      modelValue: block.value.data.setting,
      title: 'Setting',
      label: 'Setting',
    },
  }).onOk((v) => {
    patchBlock({ setting: v });
  });
}
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div class="widget-body">
      <div class="row justify-around">
        <SettingValueField
          :class="['col-auto', !block.data.enabled && 'darkish']"
          editable
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
            {{ prettyQty(block.data.setting) }}
          </template>
        </SettingValueField>
        <div class="col-break" />
      </div>

      <template v-if="context.mode === 'Full'">
        <q-separator inset />
        <div class="row q-gutter-sm">
          <LabeledField
            label="Enabled"
            class="col-auto min-width-sm"
          >
            <q-toggle
              dense
              :model-value="block.data.enabled"
              class="q-pl-md"
              @update:model-value="(v) => patchBlock({ enabled: v })"
            />
          </LabeledField>

          <DurationField
            label="Timeout"
            class="col-grow min-width-md"
            :model-value="block.data.timeout"
            @update:model-value="(v) => patchBlock({ timeout: v })"
          />
          <LabeledField label="Last update">
            {{ shortDateString(block.data.lastUpdated) }}
          </LabeledField>
        </div>
      </template>
    </div>
  </PreviewCard>
</template>
