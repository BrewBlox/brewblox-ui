<script lang="ts">
import Component from 'vue-class-component';

import BlockToolbar from '@/components/WidgetGenerics/BlockToolbar.vue';
import BlockWidget from '../BlockWidget.ts';
import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    BlockToolbar,
  },
})
/* eslint-enable */
export default class InactiveObjectWidget extends BlockWidget {}
</script>

<template>
  <div>

    <block-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
    />

    <q-card>
      <q-item>
        <q-list-header>This block is not in any active profile</q-list-header>
      </q-item>
    </q-card>

  </div>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
