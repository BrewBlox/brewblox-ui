<script lang="ts">
import Component from 'vue-class-component';

import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import BlockWidget from '../BlockWidget';
import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    WidgetToolbar,
  },
})
/* eslint-enable */
export default class InactiveObjectWidget extends BlockWidget { }
</script>

<template>
  <div>

    <widget-toolbar
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
