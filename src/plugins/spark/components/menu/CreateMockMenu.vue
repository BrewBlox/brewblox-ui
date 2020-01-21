<script lang="ts">
import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { suggestId } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { blockTypes } from '@/plugins/spark/block-types';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';
import { Service, serviceStore } from '@/store/services';


@Component
export default class CreateMockMenu extends DialogBase {
  busy = false;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get service(): Service {
    return serviceStore.serviceById(this.serviceId);
  }

  validateBlockId(val: string): boolean {
    return !blockIdRules(this.serviceId)
      .map(rule => rule(val))
      .some(isString);
  }

  async createBlock(block: Block): Promise<void> {
    this.busy = true;
    try {
      await sparkStore.createBlock([this.serviceId, block]);
      notify.done(`Created ${featureStore.displayName(block.type)} '${block.id}'`);
    } catch (e) {
      notify.error(`Failed to create Block: ${e.toString()}`);
    }
    this.busy = false;
  }

  createSensor(): void {
    const block: Block = {
      id: suggestId('temp-sensor-mock', this.validateBlockId),
      serviceId: this.serviceId,
      type: blockTypes.TempSensorMock,
      groups: [0],
      data: sparkStore.specs[blockTypes.TempSensorMock].generate(),
    };
    this.createBlock(block);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar>
          <q-item-section>
            <q-item-label>{{ service.id }}</q-item-label>
            <q-item-label caption>
              Create Mock Blocks
            </q-item-label>
          </q-item-section>
        </DialogToolbar>
      </template>

      <q-card-section>
        <q-item>
          <q-space />
          <q-item-section class="col-auto">
            <q-btn unelevated color="primary" :loading="busy" label="Create Mock Sensor" @click="createSensor" />
          </q-item-section>
          <q-space />
        </q-item>
      </q-card-section>
    </ActionCardWrapper>
  </q-dialog>
</template>
