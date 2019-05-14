<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import featureStore from '@/store/features';

@Component
export default class InactiveObjectWidget extends BlockWidget {
  get actualDisplayName() {
    return featureStore.displayNameById(this.block.data.actualType);
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <InactiveObjectForm v-if="modalOpen" v-bind="formProps"/>
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
