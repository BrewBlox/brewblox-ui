<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { displayNameById } from '@/store/features/getters';

@Component
export default class InactiveObjectWidget extends BlockWidget {
  get actualDisplayName() {
    return displayNameById(this.$store, this.block.data.actualType);
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <InactiveObjectForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column widget-body">
      <div class="full-width placeholder-text">
        This {{ actualDisplayName }} block is disabled.
        <br>To enable it, ensure that it is in an enabled group.
      </div>
    </q-card-main>
  </q-card>
</template>

<style lang="stylus" scoped>
.placeholder-text {
  color: #AA5555;
  text-align: center;
}
</style>
