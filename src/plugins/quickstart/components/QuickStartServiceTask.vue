<script lang="ts">
import { Component } from 'vue-property-decorator';

import { startCreateService } from '@/helpers/services';
import { sparkType } from '@/plugins/spark/getters';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType } from '@/plugins/spark/types';
import { Service, serviceStore, ServiceStub } from '@/store/services';

import { QuickStartOutput } from '../types';
import QuickStartTaskBase from './QuickStartTaskBase';


@Component({
  methods: {
    startCreateService,
  },
})
export default class QuickStartServiceTask extends QuickStartTaskBase<QuickStartOutput> {
  service: Service | null = null;
  handleExisting: 'keep' | 'clear' | null = null;

  mounted(): void {
    this.service = serviceStore.serviceById(this.config.serviceId);
    if (!this.service && this.services.length === 1 && this.stubs.length === 0) {
      this.service = this.services[0];
    }
  }

  get services(): Service[] {
    return serviceStore.services.filter(v => v.type === sparkType);
  }

  get stubs(): ServiceStub[] {
    return serviceStore.stubs.filter(v => v.type === sparkType);
  }

  get sparkModule(): SparkServiceModule | null {
    return this.service
      ? sparkStore.moduleById(this.service.id)
      : null;
  }

  get hasBlocks(): boolean {
    // Ignore discovered blocks
    // Any previous control chain will have included a PID
    return this.sparkModule
      ?.blocks
      .find(v => v.type === BlockType.Pid) !== undefined;
  }

  get valuesOk(): boolean {
    return this.sparkModule !== null
      && (!this.hasBlocks || this.handleExisting !== null);
  }

  clearBlocks(): void {
    if (!this.sparkModule) { return; }
    this.sparkModule.clearBlocks();
  }

  async taskDone(): Promise<void> {
    if (this.handleExisting === 'clear') {
      await this.sparkModule!.clearBlocks();
    }
    this.updateConfig({
      ...this.config,
      serviceId: this.service!.id,
    });
    this.next();
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Pick a Spark service
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-select
        v-model="service"
        :options="services"
        option-value="id"
        option-label="title"
        item-aligned
        label="Service"
      />

      <div
        v-for="stub in stubs"
        :key="'stub-'+stub.id"
        class="q-mt-lg q-pa-md column items-center q-gutter-md"
      >
        <q-icon name="warning" color="warning" size="md" class="col-auto" />
        <span>
          Detected new Spark service '{{ stub.id }}'
        </span>
        <div class="row q-gutter-x-sm">
          <q-btn
            outline
            label="Add service to UI"
            @click="startCreateService(stub, false)"
          />
        </div>
      </div>

      <div v-if="hasBlocks" class="q-mt-lg q-pa-md column items-center q-gutter-md">
        <q-icon name="warning" color="warning" size="md" class="col-auto" />
        <span>
          You already have blocks on your controller
        </span>
        <div class="row q-gutter-x-sm">
          <q-btn
            outline
            label="Keep blocks"
            :color="handleExisting === 'keep' ? 'primary' : ''"
            @click="handleExisting = 'keep'"
          />
          <q-btn
            outline
            label="Fresh start"
            :color="handleExisting === 'clear' ? 'primary' : ''"
            @click="handleExisting = 'clear'"
          />
        </div>
      </div>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="back"
      />
      <q-space />
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        @click="taskDone"
      />
    </template>
  </ActionCardBody>
</template>
