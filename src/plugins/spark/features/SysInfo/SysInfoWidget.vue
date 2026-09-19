<script setup lang="ts">
import { SysInfoBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_SPARK_PLATFORM } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import {
  dateString,
  durationString,
  roundedNumber,
  shortDateString,
} from '@/utils/quantity';

const sparkStore = useSparkStore();
const { block, serviceId } = useBlockWidget.setup<SysInfoBlock>();

const lastBlocks = computed<string>(() =>
  shortDateString(sparkStore.lastBlocksAtByService(serviceId), 'Unknown'),
);

const ready = computed<boolean>(
  () => sparkStore.statusByService(serviceId) != null,
);
</script>

<template>
  <Card v-if="ready">
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>

    <div>
      <div class="widget-body row">
        <LabeledField
          label="Firmware version"
          class="col-lg-5 col-11"
        >
          {{
            /* We only use first 8 characters of version hash */
            block.data.version.substring(0, 8)
          }}
        </LabeledField>
        <LabeledField
          label="Firmware release date"
          class="col-lg-5 col-11"
        >
          {{ block.data.releaseDate }}
        </LabeledField>
        <LabeledField
          label="Protocol version"
          class="col-lg-5 col-11"
        >
          {{ block.data.protocolVersion }}
        </LabeledField>
        <LabeledField
          label="Protocol date"
          class="col-lg-5 col-11"
        >
          {{ block.data.protocolDate }}
        </LabeledField>
        <LabeledField
          label="Controller date / time"
          class="col-lg-5 col-11"
        >
          {{ dateString(block.data.systemTime) }}
        </LabeledField>
        <LabeledField
          label="Controller uptime"
          class="col-lg-5 col-11"
        >
          {{ durationString(block.data.uptime) }}
        </LabeledField>
        <LabeledField
          label="Service ID"
          class="col-lg-5 col-11"
        >
          {{ serviceId }}
        </LabeledField>
        <LabeledField
          label="Controller ID"
          class="col-lg-5 col-11"
          tag-style="word-wrap: break-word;"
        >
          {{ block.data.deviceId }}
        </LabeledField>
        <LabeledField
          label="Platform"
          class="col-lg-5 col-11"
        >
          {{ ENUM_LABELS_SPARK_PLATFORM[block.data.platform] }}
        </LabeledField>
        <LabeledField
          label="IP address"
          class="col-lg-5 col-11"
        >
          {{ block.data.ip }}
        </LabeledField>
        <LabeledField
          label="Last blocks update"
          class="col-lg-5 col-11"
        >
          {{ lastBlocks }}
        </LabeledField>
        <LabeledField
          label="Voltage (internal)"
          class="col-lg-5 col-11"
        >
          {{ roundedNumber(block.data.voltage5, 3) }}V
        </LabeledField>
        <LabeledField
          label="Voltage (external)"
          class="col-lg-5 col-11"
        >
          {{ roundedNumber(block.data.voltageExternal, 3) }}V
        </LabeledField>
        <LabeledField
          label="Updates per second"
          class="col-lg-5 col-11"
        >
          {{ roundedNumber(block.data.updatesPerSecond, 1) }}
        </LabeledField>
        <LabeledField
          label="Free RAM"
          class="col-lg-5 col-11"
          tag-class="q-gutter-y-xs"
        >
          <div>Total: {{ block.data.memoryFree }}</div>
          <div>Contiguous: {{ block.data.memoryFreeContiguous }}</div>
          <div>Lowest: {{ block.data.memoryFreeLowest }}</div>
        </LabeledField>
        <LabeledField
          label="Free stack (main task)"
          class="col-lg-5 col-11"
        >
          <div>Lowest: {{ block.data.mainTaskStackFreeLowest }}</div>
        </LabeledField>
      </div>
    </div>
  </Card>
</template>
