<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { dateString, durationString, shortDateString } from '@/utils/quantity';
import { SysInfoBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'SysInfoWidget',
  setup() {
    const sparkStore = useSparkStore();
    const { block, serviceId } = useBlockWidget.setup<SysInfoBlock>();

    const lastBlocks = computed<string>(() =>
      shortDateString(sparkStore.lastBlocksAtByService(serviceId), 'Unknown'),
    );

    const ready = computed<boolean>(
      () => sparkStore.statusByService(serviceId) != null,
    );

    return {
      dateString,
      durationString,
      block,
      serviceId,
      ready,
      lastBlocks,
    };
  },
});
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
      </div>
    </div>
  </Card>
</template>
