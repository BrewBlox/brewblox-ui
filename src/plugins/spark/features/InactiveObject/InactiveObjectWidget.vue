<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';
import featureStore from '@/store/features';

import { InactiveObjectBlock } from './types';

@Component
export default class InactiveObjectWidget extends BlockWidget {
  readonly block!: InactiveObjectBlock;

  get actualDisplayName() {
    return featureStore.displayNameById(this.block.data.actualType);
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <InactiveObjectForm
        v-if="modalOpen"
        v-bind="$props"
        :block="block"
        @update:block="saveBlock"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <q-item dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>
          This {{ actualDisplayName }} block is disabled.
          <br>To enable it, ensure that it is in an enabled group.
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
