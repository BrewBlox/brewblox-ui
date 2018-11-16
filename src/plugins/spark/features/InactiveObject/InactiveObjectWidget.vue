<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';

@Component
export default class InactiveObjectWidget extends BlockWidget {
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen">
      <InactiveObjectForm
        v-if="modalOpen"
        :field="block"
        :change="saveBlock"
      />
    </q-modal>

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit
          :field="widgetId"
          label="Widget ID"
          display="span"
          :change="v => widgetId = v"
        />
        <span class="vertical-middle on-left" slot="right">{{ this.subtitle }}</span>
        <q-btn
          slot="right"
          flat
          dense
          round
          @click="() => this.modalOpen = true"
          icon="settings"
        />
        <q-btn
          slot="right"
          flat
          round
          dense
          @click="refreshBlock"
          icon="refresh"
        />
      </q-card-title>
      <q-card-separator />

      <q-alert type="info" class="centered">
        This block is not in any active profile
      </q-alert>

    </q-card>
  </div>
</template>

<style scoped>
</style>
