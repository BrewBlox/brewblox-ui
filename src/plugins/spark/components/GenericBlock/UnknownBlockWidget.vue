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
    if (!status || !status.synchronize) {
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
}

</script>

<template>
  <q-card dark class="text-white scroll">
    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat label="Menu">
          <q-list dark bordered>
            <ActionItem
              :disable="!reason.temporary"
              icon="refresh"
              label="Refresh"
              @click="fetchAll"
            />
            <RemoveWidgetAction :crud="crud"/>
          </q-list>
        </q-btn-dropdown>
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
