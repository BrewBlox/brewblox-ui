<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { shortDateString } from '@/helpers/functional';
import { startChangeServiceTitle } from '@/helpers/services';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  Block,
  SysInfoBlock,
  SystemBlockType,
  TicksBlock,
  WiFiSettingsBlock,
} from '@/plugins/spark/types';
import { WidgetContext } from '@/store/features';
import { Service, serviceStore } from '@/store/services';

@Component
export default class SparkWidget extends Vue {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: Object, default: () => ({ mode: 'Basic', container: 'Dashboard' }) })
  public readonly context!: WidgetContext;

  get inDialog(): boolean {
    return this.context.container === 'Dialog';
  }

  get service(): Service | null {
    return serviceStore.serviceById(this.serviceId)!;
  }

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get ready(): boolean {
    return this.service !== null
      && this.sparkModule !== null
      && this.sparkModule.lastBlocks !== null;
  }

  get lastBlocks(): string {
    return shortDateString(this.sparkModule?.lastBlocks, 'Unknown');
  }

  get title(): string {
    return this.service?.title ?? 'Unknown';
  }

  sysBlock<T extends Block>(blockType: SystemBlockType): T {
    return this.sparkModule!.blocks
      .find(block => block.type === blockType) as T;
  }

  get sysInfo(): SysInfoBlock {
    return this.sysBlock(SystemBlockType.SysInfo);
  }

  get ticks(): TicksBlock {
    return this.sysBlock(SystemBlockType.Ticks);
  }

  get wifi(): WiFiSettingsBlock {
    return this.sysBlock(SystemBlockType.WiFiSettings);
  }

  get sysDate(): string {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  fetchAll(): void {
    this.sparkModule?.fetchAll();
  }

  changeTitle(): void {
    if (this.service) {
      startChangeServiceTitle(this.service);
    }
  }
}
</script>

<template>
  <CardWrapper v-if="ready" v-bind="{context}">
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
          {{ sysInfo.data.version }}
        </LabeledField>
        <LabeledField label="Firmware release date" class="col-lg-5 col-11">
          {{ sysInfo.data.releaseDate }}
        </LabeledField>
        <LabeledField label="Controller date / time" class="col-lg-5 col-11">
          {{ sysDate }}
        </LabeledField>
        <LabeledField label="Controller uptime" class="col-lg-5 col-11">
          {{ ticks.data.millisSinceBoot | duration }}
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
  </CardWrapper>
</template>
