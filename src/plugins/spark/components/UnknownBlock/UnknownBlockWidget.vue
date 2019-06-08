<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

interface AbsenceReason {
  message: string;
  temporary: boolean;
}

@Component
export default class UnknownBlockWidget extends WidgetBase {
  modalOpen: boolean = false;

  get serviceId(): string {
    return this.widget.config.serviceId;
  }

  get blockId(): string {
    return this.widget.config.blockId;
  }

  get block(): Block {
    return {
      id: this.blockId,
      serviceId: this.serviceId,
      type: this.widget.feature,
      groups: [],
      data: {},
    };
  }

  get reason(): AbsenceReason {
    const status = sparkStore.lastStatus(this.serviceId);
    if (!status || !status.synchronized) {
      return {
        message: 'Waiting for service...',
        temporary: true,
      };
    }
    return {
      message: `Block ${this.blockId} not found on service ${this.serviceId}`,
      temporary: false,
    };
  }

  fetchAll() {
    sparkStore.fetchAll(this.serviceId);
  }

  public async saveBlock(block: Block = this.block): Promise<void> {
    await sparkStore.saveBlock([this.serviceId, block])
      .catch(() => this.$forceUpdate());
  }
}

</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <UnknownBlockForm v-if="modalOpen" v-bind="$props" :block="block" @update:block="saveBlock"/>
    </q-dialog>

    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section class="dense" side>
        <q-btn flat round dense icon="settings" @click="modalOpen = true"/>
      </q-item-section>
      <q-item-section class="dense" side>
        <q-btn :disable="!reason.temporary" flat round dense icon="refresh" @click="fetchAll"/>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section v-if="reason.temporary" avatar>
          <q-spinner size="25px"/>
        </q-item-section>
        <q-item-section v-else avatar>
          <q-icon name="warning" color="negative"/>
        </q-item-section>
        <q-item-section>{{ reason.message }}</q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.dense {
  padding: 0px;
}
</style>
