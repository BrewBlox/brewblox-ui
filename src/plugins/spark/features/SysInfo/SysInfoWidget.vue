<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  Block,
  SparkService,
  SysInfoBlock,
  SystemBlockType,
  TicksBlock,
  WiFiSettingsBlock,
} from '@/plugins/spark/types';
import { serviceStore } from '@/store/services';
import { durationString } from '@/utils/duration';
import { shortDateString } from '@/utils/functional';
import { startChangeServiceTitle } from '@/utils/services';

export default defineComponent({
  name: 'SysInfoWidget',
  setup() {
    const { inDialog } = useContext.setup();
    const { serviceId } = useBlockWidget.setup<SysInfoBlock>();

    const service = computed<SparkService | null>(
      () => serviceStore.serviceById(serviceId),
    );

    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(serviceId),
    );

    const ready = computed<boolean>(
      () => service.value !== null
        && sparkModule.value !== null
        && sparkModule.value.lastBlocks !== null,
    );

    const lastBlocks = computed<string>(
      () => shortDateString(sparkModule.value?.lastBlocks, 'Unknown'),
    );

    const title = computed<string>(
      () => service.value?.title ?? 'Unknown',
    );

    function sysBlock<T extends Block>(blockType: SystemBlockType): T {
      return sparkModule.value!.blocks
        .find(block => block.type === blockType) as T;
    }

    const sysInfo = computed<SysInfoBlock>(
      () => sysBlock(SystemBlockType.SysInfo),
    );

    const ticks = computed<TicksBlock>(
      () => sysBlock(SystemBlockType.Ticks),
    );

    const wifi = computed<WiFiSettingsBlock>(
      () => sysBlock(SystemBlockType.WiFiSettings),
    );

    const uptime = computed<string>(
      () => durationString(ticks.value.data.millisSinceBoot),
    );

    const sysDate = computed<string>(
      () => new Date(ticks.value.data.secondsSinceEpoch * 1000).toLocaleString(),
    );

    function fetchAll(): void {
      sparkModule.value?.fetchAll();
    }

    function changeTitle(): void {
      startChangeServiceTitle(service.value);
    }

    return {
      inDialog,
      serviceId,
      ready,
      lastBlocks,
      title,
      sysInfo,
      ticks,
      wifi,
      uptime,
      sysDate,
      fetchAll,
      changeTitle,
    };
  },
});
</script>

<template>
  <Card v-if="ready">
    <template #toolbar>
      <DialogToolbar
        v-if="inDialog"
        :title="title"
        subtitle="Device info"
        @title-click="changeTitle"
      >
        <template #buttons>
          <q-btn flat round icon="refresh" @click="fetchAll" />
        </template>
      </DialogToolbar>
      <Toolbar
        v-else
        :title="title"
        subtitle="Device info"
        @title-click="changeTitle"
      >
        <template #buttons>
          <q-btn flat dense round icon="refresh" @click="fetchAll" />
        </template>
      </Toolbar>
    </template>

    <div class="widget-md">
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
          {{ wifi.data.ip }}
        </LabeledField>
        <LabeledField label="Last blocks update" class="col-lg-5 col-11">
          {{ lastBlocks }}
        </LabeledField>
      </div>
    </div>
  </Card>
</template>
