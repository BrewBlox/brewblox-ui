<script lang="ts">
import { defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { TempSensorExternalBlock } from '@/shared-types';
import { createDialog } from '@/utils/dialog';
import { prettyQty, shortDateString } from '@/utils/quantity';

export default defineComponent({
  name: 'TempSensorExternalWidget',
  setup() {
    const { context, inDialog } = useContext.setup();
    const { block, patchBlock } =
      useBlockWidget.setup<TempSensorExternalBlock>();

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

    return {
      prettyQty,
      shortDateString,
      context,
      inDialog,
      block,
      patchBlock,
      editSetting,
    };
  },
});
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
            <q-icon
              name="mdi-thermometer"
              color="green-3"
            />
          </template>
          <template #value>
            {{ prettyQty(block.data.value) }}
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
