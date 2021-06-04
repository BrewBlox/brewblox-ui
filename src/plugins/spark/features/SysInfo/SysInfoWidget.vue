<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  SparkService,
  SysInfoBlock,
  TicksBlock,
  WiFiSettingsBlock,
} from '@/plugins/spark/types';
import { serviceStore } from '@/store/services';
import { durationString } from '@/utils/duration';
import { shortDateString } from '@/utils/functional';

import { getTicksBlock, getWiFiSettingsBlock } from '../../utils';

export default defineComponent({
  name: 'SysInfoWidget',
  setup() {
    const { inDialog } = useContext.setup();
    const { block, serviceId } = useBlockWidget.setup<SysInfoBlock>();

    const service = computed<SparkService | null>(
      () => serviceStore.serviceById(serviceId),
    );

    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(serviceId),
    );

    const lastBlocks = computed<string>(
      () => shortDateString(sparkModule.value?.lastBlocks, 'Unknown'),
    );

    const sysInfo = computed<SysInfoBlock>(
      () => block.value,
    );

    const ticks = computed<TicksBlock | undefined>(
      () => getTicksBlock(serviceId),
    );

    const wifi = computed<WiFiSettingsBlock | undefined>(
      () => getWiFiSettingsBlock(serviceId),
    );

    const uptime = computed<string>(
      () => durationString(ticks.value?.data.millisSinceBoot),
    );

    const sysDate = computed<string>(
      () => ticks.value
        ? new Date(ticks.value.data.secondsSinceEpoch * 1000).toLocaleString()
        : 'Unknown',
    );

    const ipAddress = computed<string>(
      () => wifi.value
        ? wifi.value.data.ip
        : '0.0.0.0',
    );

    const ready = computed<boolean>(
      () => service.value !== null
        && sparkModule.value !== null
        && sparkModule.value.lastBlocks !== null,
    );

    return {
      inDialog,
      serviceId,
      ready,
      lastBlocks,
      sysInfo,
      uptime,
      sysDate,
      ipAddress,
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
        <LabeledField label="Firmware version" class="col-lg-5 col-11">
          {{ sysInfo.data.version.substring(0, 8) /* We only use first 8 characters of version hash */ }}
        </LabeledField>
        <LabeledField label="Firmware release date" class="col-lg-5 col-11">
          {{ sysInfo.data.releaseDate }}
        </LabeledField>
        <LabeledField label="Controller date / time" class="col-lg-5 col-11">
          {{ sysDate }}
        </LabeledField>
        <LabeledField label="Controller uptime" class="col-lg-5 col-11">
          {{ uptime }}
        </LabeledField>
        <LabeledField label="Service ID" class="col-lg-5 col-11">
          {{ serviceId }}
        </LabeledField>
        <LabeledField label="Controller ID" class="col-lg-5 col-11" tag-style="word-wrap: break-word;">
          {{ sysInfo.data.deviceId }}
        </LabeledField>
        <LabeledField label="IP address" class="col-lg-5 col-11">
          {{ ipAddress }}
        </LabeledField>
        <LabeledField label="Last blocks update" class="col-lg-5 col-11">
          {{ lastBlocks }}
        </LabeledField>
      </div>
    </div>
  </Card>
</template>
