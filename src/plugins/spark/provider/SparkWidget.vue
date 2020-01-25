<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { shortDateString } from '@/helpers/functional';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { WidgetContext } from '@/store/features';

import { blockTypes, SysInfoBlock, TicksBlock, WiFiSettingsBlock } from '../block-types';
import { isReady } from './getters';

@Component
export default class SparkWidget extends Vue {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: Object, default: () => ({ mode: 'Basic', container: 'Dashboard' }) })
  public readonly context!: WidgetContext;

  get inDialog(): boolean {
    return this.context.container === 'Dialog';
  }

  get lastUpdate(): string {
    return shortDateString(sparkStore.lastUpdate(this.serviceId), 'Unknown');
  }

  sysBlock<T extends Block>(blockType: string): T {
    return sparkStore.blockValues(this.serviceId)
      .find(block => block.type === blockType) as T;
  }

  get sysInfo(): SysInfoBlock {
    return this.sysBlock(blockTypes.SysInfo);
  }

  get ticks(): TicksBlock {
    return this.sysBlock(blockTypes.Ticks);
  }

  get wifi(): WiFiSettingsBlock {
    return this.sysBlock(blockTypes.WiFiSettings);
  }

  get ready(): boolean {
    return isReady(this.serviceId);
  }

  get sysDate(): string {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  fetchAll(): void {
    sparkStore.fetchSettings(this.serviceId);
    sparkStore.fetchBlocks(this.serviceId);
  }
}
</script>

<template>
  <CardWrapper v-if="ready" v-bind="{context}">
    <template #toolbar>
      <DialogToolbar v-if="inDialog" :title="serviceId" subtitle="Device info">
        <template #buttons>
          <q-btn flat round icon="refresh" @click="fetchAll" />
        </template>
      </DialogToolbar>
      <Toolbar v-else :title="serviceId" subtitle="Device info">
        <template #buttons>
          <q-btn flat dense icon="refresh" @click="fetchAll" />
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
        <LabeledField label="IP address" class="col-lg-5 col-11">
          {{ wifi.data.ip }}
        </LabeledField>
        <LabeledField label="Controller ID" class="col-lg-5 col-11" tag-style="word-wrap: break-word;">
          {{ sysInfo.data.deviceId }}
        </LabeledField>
        <LabeledField label="Last blocks update" class="col-lg-5 col-11">
          {{ lastUpdate }}
        </LabeledField>
      </div>
    </div>
  </CardWrapper>
</template>
